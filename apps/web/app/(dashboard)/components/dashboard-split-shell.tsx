"use client";

import type { ReactNode } from "react";

import CalendarTaskSplit from "@/app/(dashboard)/calendar/[slug]/components/CalendarTaskSplit";

import { DashboardActionsPanel } from "./dashboard-actions-panel";

type DashboardSplitShellProps = {
  children: ReactNode;
};

export function DashboardSplitShell({ children }: DashboardSplitShellProps) {
  return (
    <div className="h-full min-h-0">
      <CalendarTaskSplit className="h-full">
        <div className="h-full min-h-0 overflow-auto">
          {children}
        </div>
        <DashboardActionsPanel />
      </CalendarTaskSplit>
    </div>
  );
}

export default DashboardSplitShell;
