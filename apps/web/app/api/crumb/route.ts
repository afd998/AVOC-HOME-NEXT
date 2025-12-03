// app/api/crumb/route.ts
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { eq, db, faculty, events, rooms } from "shared";
import { unstable_cacheTag as cacheTag } from "next/cache"; 
import { revalidateTag } from "next/cache";

const LABEL_OVERRIDES: Record<string, string> = {
  dashboard: "Dashboard",
  calendar: "Calendar",
  faculty: "Faculty",
  events: "Events",
  venues: "Venues",
  settings: "Settings",
  schedule: "Schedule",
  "session-assignments": "Session Assignments",
  "user-profile": "Profile",
  about: "About",
};

const DATE_SEGMENT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type BreadcrumbItemData = {
  key: string;
  label: string;
  href: string;
  isCurrent: boolean;
  isDate?: boolean;
  prevHref?: string;
  nextHref?: string;
};

function buildHref(segments: string[]): string {
  return `/${segments.join("/")}`;
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function toDateSegment(date: Date): string {
  return date.toISOString().slice(0, 10);
}
async function generateBreadcrumbs(
  pathname: string
): Promise<BreadcrumbItemData[]> {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbItemData[] = [];
  const facultyNameCache = new Map<number, string | null>();
  const eventNameCache = new Map<number, string | null>();
  const venueNameCache = new Map<number, string | null>();

  const getFacultyName = async (id: number): Promise<string | null> => {
    if (facultyNameCache.has(id)) {
      return facultyNameCache.get(id) ?? null;
    }
    try {
      const record = await db.query.faculty.findFirst({     
        where: eq(faculty.id, id),
        columns: {
          kelloggdirectoryName: true,
        },
      });
      const name = record?.kelloggdirectoryName ?? null;
      facultyNameCache.set(id, name);
      return name;
    } catch (error) {
      console.error(`[crumb] failed to load faculty ${id}:`, error);
      facultyNameCache.set(id, null);
      return null;
    }
  };

  const getEventName = async (id: number): Promise<string | null> => {
    if (eventNameCache.has(id)) {
      return eventNameCache.get(id) ?? null;
    }
    try {
      const record = await db.query.events.findFirst({
        where: eq(events.id, id),
        columns: {
          eventName: true,
        },
      });
      const name = record?.eventName ?? null;
      eventNameCache.set(id, name);
      return name;
    } catch (error) {
      console.error(`[crumb] failed to load event ${id}:`, error);
      eventNameCache.set(id, null);
      return null;
    }
  };

  const getVenueName = async (id: number): Promise<string | null> => {
    if (venueNameCache.has(id)) {
      return venueNameCache.get(id) ?? null;
    }
    try {
      const record = await db.query.rooms.findFirst({
        where: eq(rooms.id, id),
        columns: {
          name: true,
          spelling: true,
        },
      });
      const name = record?.name ?? record?.spelling ?? null;
      venueNameCache.set(id, name);
      return name;
    } catch (error) {
      console.error(`[crumb] failed to load venue ${id}:`, error);
      venueNameCache.set(id, null);
      return null;
    }
  };

  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    const pathSegments = segments.slice(0, index + 1);
    const previousSegments = segments.slice(0, index);
    const isCurrent = index === segments.length - 1;
    const normalized = segment.toLowerCase();

    let label =
      LABEL_OVERRIDES[normalized] ?? (formatSegmentLabel(segment) || segment);

    const href = buildHref(pathSegments);
    let isDate = false;
    let prevHref: string | undefined;
    let nextHref: string | undefined;

    if (DATE_SEGMENT_REGEX.test(segment)) {
      const date = new Date(`${segment}T00:00:00`);

      if (!Number.isNaN(date.getTime())) {
        label = formatDateLabel(date);
        isDate = true;

        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        prevHref = buildHref([...previousSegments, toDateSegment(prevDate)]);
        nextHref = buildHref([...previousSegments, toDateSegment(nextDate)]);
      }
    } else if (/^\d+$/.test(segment)) {
      const parentSegment = previousSegments.at(-1);

      if (parentSegment === "faculty") {
        const facultyId = Number(segment);

        if (!Number.isNaN(facultyId)) {
          const resolvedName = await getFacultyName(facultyId);
          if (resolvedName) {
            label = resolvedName;
          }
        }
      } else if (parentSegment === "events") {
        const eventId = Number(segment);

        if (!Number.isNaN(eventId)) {
          const resolvedName = await getEventName(eventId);
          if (resolvedName) {
            label = resolvedName;
          }
        }
      } else if (parentSegment === "venues") {
        const venueId = Number(segment);

        if (!Number.isNaN(venueId)) {
          const resolvedName = await getVenueName(venueId);
          if (resolvedName) {
            label = resolvedName;
          } else {
            label = `Room ${venueId}`;
          }
      }
    }
    }

    breadcrumbs.push({
      key: href,
      label,
      href,
      isCurrent,
      isDate,
      prevHref,
      nextHref,
    });
  }

  return breadcrumbs;
}
// Example: lookupCrumb calls your DB or upstream API
async function lookupCrumb(path: string) {
  const breadcrumbs = await generateBreadcrumbs(path);
  return breadcrumbs;
}

// Wrap with unstable_cache to create a memoized, taggable cache on the server
const getCrumb = async (path: string) => {  
  "use cache";
  cacheTag(`crumb:${path}`)
  return lookupCrumb(path)
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "/";
  try {
    const crumb = await getCrumb(path);
    return NextResponse.json({ ok: true, path, crumb });
  } catch (e) {
    return NextResponse.json(
      { ok: false, path, error: (e as Error).message },
      { status: 500 }
    );
  }
}

// Optional: if you need an imperative invalidation endpoint elsewhere:
// export async function POST(req: Request) {
//   const { path } = await req.json();
//   // import { revalidateTag } from "next/cache"; before enabling this handler.
//   revalidateTag(`crumb:${path}`);
//   return NextResponse.json({ ok: true });
// }
