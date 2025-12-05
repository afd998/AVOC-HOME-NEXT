import { chromium, type Browser, type Page } from "playwright";
import config from "../config";
import {
  db,
  faculty,
  eq,
  and,
  sql,
  pgPool,
  type InferSelectModel,
} from "shared";
import { isNotNull } from "drizzle-orm";

type FacultyRow = InferSelectModel<typeof faculty>;

type ScrapedFaculty = {
  name?: string | null;
  title?: string | null;
  subtitle?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  email?: string | null;
};

type ScriptOptions = {
  dryRun: boolean;
  onlyMissing: boolean;
  limit?: number;
  id?: number;
  headless?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const findNumericArg = (prefix: string): number | undefined => {
    const match = args.find((arg) => arg.startsWith(prefix));
    if (!match) return undefined;
    const value = Number.parseInt(match.split("=")[1], 10);
    return Number.isFinite(value) ? value : undefined;
  };

  return {
    dryRun: args.includes("--dry-run"),
    onlyMissing: args.includes("--only-missing"),
    limit: findNumericArg("--limit="),
    id: findNumericArg("--id="),
    headless: args.includes("--show") ? false : undefined,
  };
}

function normalizeText(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

function normalizeBio(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
  return cleaned || null;
}

function normalizeUrl(raw: string | null, baseUrl: string): string | null {
  if (!raw) return null;
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return raw;
  }
}

function normalizeEmail(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^mailto:/i, "").trim().toLowerCase();
  if (!cleaned) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleaned)) return null;
  return cleaned;
}

async function scrapeFacultyPage(
  page: Page,
  nameHint?: string | null
): Promise<ScrapedFaculty> {
  return page.evaluate(
    (hint) => {
      // Provide __name helper expected by esbuild-transpiled functions in this scope
      const __name =
        (globalThis as any).__name ||
        ((target: { name?: string }, value: string) => {
          try {
            Object.defineProperty(target, "name", {
              value,
              configurable: true,
            });
          } catch {
            /* ignore */
          }
          return target;
        });

      const clean = (value?: string | null) => {
        if (!value) return null;
        const cleaned = value
          .replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return cleaned || null;
      };

      const cleanUrl = (raw?: string | null) => {
        if (!raw) return null;
        try {
          return new URL(raw, document.baseURI).href;
        } catch {
          return raw;
        }
      };

      const pickFirstText = (selectors: string[]) => {
        for (const selector of selectors) {
          const el = document.querySelector<HTMLElement>(selector);
          const text = clean(el?.innerText || el?.textContent || null);
          if (text) return text;
        }
        return null;
      };

      const findName = () => {
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>(
            'h1, [class*="name" i], [class*="heading" i]'
          )
        )
          .map((el) => clean(el.innerText || el.textContent))
          .filter(Boolean) as string[];

        const unique = Array.from(new Set(candidates));
        const preferred = unique.find(
          (candidate) => candidate && candidate.length > 3
        );
        return preferred || null;
      };

      const findTitle = () => {
        const explicitTitle =
          document.querySelector<HTMLElement>(".faculty-bio__title p") ||
          document.querySelector<HTMLElement>(".faculty-bio__title");
        const explicitText = clean(
          explicitTitle?.innerText || explicitTitle?.textContent || null
        );
        if (explicitText) return explicitText;

        const selectors = [
          "[itemprop='jobTitle']",
          "[itemprop='role']",
          '[class*=\"title\" i]',
          '[class*=\"position\" i]',
          "h2",
          "h3",
        ];
        const values = selectors
          .map((selector) => {
            const el = document.querySelector<HTMLElement>(selector);
            return clean(el?.innerText || el?.textContent || null);
          })
          .filter(Boolean) as string[];

        const unique = Array.from(new Set(values));
        const filteredByName = unique.filter(
          (val) => !hint || !val?.includes(hint)
        );
        return filteredByName[0] || unique[0] || null;
      };

      const findSubtitle = () => {
        const selectors = [
          '[class*=\"subtitle\" i]',
          '[class*=\"eyebrow\" i]',
          '[class*=\"lead\" i]',
          '[class*=\"highlight\" i]',
          "h4",
        ];
        return pickFirstText(selectors);
      };

      const findBio = () => {
        const overview = document.querySelector<HTMLElement>(
          ".faculty-bio__overview"
        );
        if (overview) {
          const paragraphs = Array.from(
            overview.querySelectorAll<HTMLElement>("p, li")
          )
            .map((el) => clean(el.innerText || el.textContent))
            .filter(Boolean) as string[];

          if (paragraphs.length > 0) {
            const combined = paragraphs.join("\n\n");
            if (combined.length > 40) {
              return combined;
            }
          }
        }

        const bioSelectors = [
          '[id*=\"bio\" i]',
          '[class*=\"bio\" i]',
          '[data-section*=\"bio\" i]',
          '[aria-label*=\"bio\" i]',
        ];

        const gatherText = (root: Element | null | undefined) => {
          if (!root) return null;
          const paragraphs = Array.from(
            root.querySelectorAll<HTMLElement>("p")
          )
            .map((p) => clean(p.innerText || p.textContent))
            .filter(Boolean) as string[];
          if (paragraphs.length > 0) {
            return paragraphs.join("\n\n");
          }
          return clean(root.textContent);
        };

        for (const selector of bioSelectors) {
          const match = document.querySelector<HTMLElement>(selector);
          const text = gatherText(match);
          if (text && text.length > 40) {
            return text;
          }
        }

        const heading = Array.from(
          document.querySelectorAll<HTMLElement>("h2, h3")
        ).find((el) => /bio/i.test(el.textContent || ""));
        if (heading) {
          const container =
            heading.closest("section, article, div") || heading.parentElement;
          const text = gatherText(container);
          if (text && text.length > 40) {
            return text;
          }
        }

        const metaDescription = clean(
          document
            .querySelector<HTMLMetaElement>('meta[name="description"]')
            ?.getAttribute("content")
        );
        return metaDescription || null;
      };

      const findImage = () => {
        const og = cleanUrl(
          document
            .querySelector<HTMLMetaElement>('meta[property=\"og:image\"]')
            ?.getAttribute("content")
        );
        if (og) return og;

        const images = Array.from(document.images)
          .map((img) => img.currentSrc || img.src)
          .map((src) => cleanUrl(src))
          .filter(Boolean)
          .map((src) => src as string)
          .filter(
            (src) =>
              !/logo|favicon|sprite|icon|placeholder/i.test(src) &&
              !src.endsWith(".svg")
          );

        const unique = Array.from(new Set(images));
        return unique[0] || null;
      };

      const findEmail = () => {
        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')
        );

        const preferred = anchors.find((a) =>
          a.className.toLowerCase().includes("faculty-bio__contact-email")
        );
        if (preferred?.href) return preferred.href;

        const first = anchors.find((a) => !!a.href);
        return first?.href ?? null;
      };

      return {
        name: findName(),
        title: findTitle(),
        subtitle: findSubtitle(),
        bio: findBio(),
        imageUrl: findImage(),
        email: findEmail(),
      };
    },
    nameHint ?? null
  );
}

async function fetchFacultyRows(options: ScriptOptions): Promise<FacultyRow[]> {
  const filters = [
    isNotNull(faculty.kelloggdirectoryBioUrl),
    sql`nullif(trim(${faculty.kelloggdirectoryBioUrl}), '') is not null`,
  ];

  if (options.id) {
    filters.push(eq(faculty.id, options.id));
  }

  if (options.onlyMissing) {
    filters.push(
      sql`(${faculty.kelloggdirectoryTitle} is null or ${faculty.kelloggdirectoryImageUrl} is null or ${faculty.kelloggdirectoryBio} is null or ${faculty.kelloggdirectorySubtitle} is null or ${faculty.email} is null)`
    );
  }

  let query = db
    .select()
    .from(faculty)
    .where(and(...filters))
    .orderBy(faculty.id);

  if (options.limit && options.limit > 0) {
    query = query.limit(options.limit);
  }

  return query;
}

function buildUpdatePayload(
  row: FacultyRow,
  scraped: ScrapedFaculty
): Partial<typeof faculty.$inferInsert> {
  const payload: Partial<typeof faculty.$inferInsert> = {};

  const name = normalizeText(scraped.name);
  const title = normalizeText(scraped.title);
  const subtitle = normalizeText(scraped.subtitle);
  const bio = normalizeBio(scraped.bio);
  const imageUrl = normalizeUrl(scraped.imageUrl ?? null, row.kelloggdirectoryBioUrl ?? "") ||
    null;
  const email = normalizeEmail(scraped.email);

  if (!row.kelloggdirectoryName && name) {
    payload.kelloggdirectoryName = name;
  }
  if (title && title !== row.kelloggdirectoryTitle) {
    payload.kelloggdirectoryTitle = title;
  }
  if (subtitle && subtitle !== row.kelloggdirectorySubtitle) {
    payload.kelloggdirectorySubtitle = subtitle;
  }
  if (bio && bio !== row.kelloggdirectoryBio) {
    payload.kelloggdirectoryBio = bio;
  }
  if (imageUrl && imageUrl !== row.kelloggdirectoryImageUrl) {
    payload.kelloggdirectoryImageUrl = imageUrl;
  }
  if (email && email !== row.email) {
    payload.email = email;
  }

  if (Object.keys(payload).length > 0) {
    payload.updatedAt = new Date().toISOString();
  }

  return payload;
}

async function main() {
  const options = parseArgs();

  const rows = await fetchFacultyRows(options);
  if (rows.length === 0) {
    console.log("No faculty rows matched the current filters.");
    await pgPool.end();
    return;
  }

  console.log(
    `Preparing to scrape ${rows.length} faculty profiles${options.dryRun ? " (dry run)" : ""}${options.onlyMissing ? " [only-missing]" : ""}${
      options.limit ? ` [limit=${options.limit}]` : ""
    }`
  );

  let browser: Browser | null = null;

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    browser = await chromium.launch({
      headless: options.headless ?? config.browser.headless,
    });
    const context = await browser.newContext();
    // Ensure __name helper exists in the page context (esbuild injects __name calls)
    await context.addInitScript(() => {
      (window as unknown as { __name?: (target: any, value: string) => any }).__name =
        (window as any).__name ||
        ((target: any, value: string) => {
          try {
            Object.defineProperty(target, "name", { value, configurable: true });
          } catch {
            /* ignore */
          }
          return target;
        });
    });

    for (const row of rows) {
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(config.browser.timeout);
      page.setDefaultTimeout(config.browser.timeout);

      try {
        const url = row.kelloggdirectoryBioUrl!;
        console.log(`\n[${row.id}] Visiting ${url}`);
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: config.browser.timeout,
        });

        const scraped = await scrapeFacultyPage(
          page,
          row.kelloggdirectoryName ?? row.twentyfiveliveName
        );
        const payload = buildUpdatePayload(row, scraped);

        if (Object.keys(payload).length === 0) {
          console.log(`[${row.id}] No new data found; skipping.`);
          skipped += 1;
        } else if (options.dryRun) {
          console.log(`[${row.id}] DRY RUN update:`, payload);
          skipped += 1;
        } else {
          await db.update(faculty).set(payload).where(eq(faculty.id, row.id));
          console.log(
            `[${row.id}] Updated fields: ${Object.keys(payload).join(", ")}`
          );
          updated += 1;
        }
      } catch (error) {
        console.error(`[${row.id}] Failed to scrape:`, error);
        failed += 1;
      } finally {
        processed += 1;
        await page.close();
        await sleep(300);
      }
    }

    console.log(
      `\nFinished. processed=${processed} updated=${updated} skipped=${skipped} failed=${failed}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    await pgPool.end();
  }
}

void main().catch((error) => {
  console.error("Scrape exited with error:", error);
  process.exitCode = 1;
});
