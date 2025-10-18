"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { usePathname } from "next/navigation";

type BreadcrumbItemData = {
  key: string;
  label: string;
  href: string;
  isCurrent: boolean;
  isDate?: boolean;
  prevHref?: string;
  nextHref?: string;
};

type BreadcrumbPayload = {
  ok: boolean;
  path: string;
  crumb: BreadcrumbItemData[];
  error?: string;
};

export default function HeaderBreadcrumb() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItemData[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        setLoading(true);
        const res = await fetch(
          `/api/crumb?path=${encodeURIComponent(pathname)}`,
          {
            signal: controller.signal,
          }
        );
        const json: BreadcrumbPayload = await res.json();

        if (!cancelled) {
          if (json.ok) {
            setBreadcrumbs(json.crumb);
          } else {
            setBreadcrumbs([]);
            setError(json.error ?? "Failed to load breadcrumbs");
          }
        }
      } catch (e) {
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : "Failed to load breadcrumbs";
          setError(message);
          setBreadcrumbs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pathname]);

  const hasBreadcrumbs = (breadcrumbs?.length ?? 0) > 0;

  if (!loading && !hasBreadcrumbs && !error) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="h-8 gap-2 rounded-md px-3 text-sm">
        {!loading &&
          breadcrumbs?.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isCurrent && item.isDate ? (
                  <div className="flex items-center gap-2">
                    {item.prevHref && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Link href={item.prevHref} aria-label="Previous day">
                          <ChevronLeft className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    {item.nextHref && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Link href={item.nextHref} aria-label="Next day">
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : item.isCurrent ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        {!loading && error && (
          <>
            {hasBreadcrumbs && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              <BreadcrumbPage>{error}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
