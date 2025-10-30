"use client";

import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TaskPanelHeaderProps = {
  onGoToNow?: () => void;
  goNowDisabled?: boolean;
  totalTasks: number;
};

export default function TaskPanelHeader({
  onGoToNow,
  goNowDisabled = false,
  totalTasks,
}: TaskPanelHeaderProps) {
  const totalLabel =
    totalTasks === 1 ? "1 total task" : `${totalTasks} total tasks`;

  return (
    <header className="border-b px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold leading-none">Task View</h2>
            <Badge variant="secondary" className="text-xs font-medium">
              {totalLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Review upcoming tasks alongside the calendar.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onGoToNow}
          disabled={goNowDisabled}
          aria-label="Scroll to current time"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
