"use client";

import { Suspense, type ReactNode } from "react";

import CalendarTaskSplit from "@/app/(dashboard)/calendar/[slug]/components/CalendarTaskSplit";

import { DashboardActionsPanel } from "./dashboard-actions-panel";

type DashboardSplitShellProps = {
  children: ReactNode;
};

function DashboardActionsPanelFallback() {
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

export function DashboardSplitShell({ children }: DashboardSplitShellProps) {
  return (
    <div className="h-full min-h-0">
      <CalendarTaskSplit className="h-full">
        <div className="h-full min-h-0 overflow-auto">
          {children}
        </div>
        <Suspense fallback={<DashboardActionsPanelFallback />}>
          <DashboardActionsPanel />
        </Suspense>
      </CalendarTaskSplit>
    </div>
  );
}

export default DashboardSplitShell;
