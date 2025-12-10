"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";

import ActionsPanel from "@/app/(dashboard)/calendar/[slug]/components/ActionsPanel";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function DashboardActionsPanelFallback() {
  return (
    <div className="flex h-full flex-col rounded-md border border-border/60 bg-muted/40 p-4">
      <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/20" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-3 w-full animate-pulse rounded bg-muted-foreground/15"
          />
        ))}
      </div>
    </div>
  );
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateCandidate(
  candidate: string | string[] | undefined
): string | null {
  if (!candidate) return null;

  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  return DATE_REGEX.test(value) ? value : null;
}

export function DashboardActionsPanel() {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filter = searchParams?.get("filter") ?? "All Rooms";
  const autoHideParam = searchParams?.get("autoHide");
  const autoHide = autoHideParam === "true" || autoHideParam === "1";

  const date = useMemo(() => {
    const searchDate = searchParams?.get("date");
    const slugDate =
      pathname?.startsWith("/calendar") && normalizeDateCandidate(params?.slug);

    if (slugDate) return slugDate;
    if (searchDate && DATE_REGEX.test(searchDate)) return searchDate;

    return getTodayDate();
  }, [params, pathname, searchParams]);

  if (!isClient) {
    return <DashboardActionsPanelFallback />;
  }

  return (
    <ActionsPanel
      date={date}
      filter={filter}
      autoHide={autoHide}
    />
  );
}

export default DashboardActionsPanel;
