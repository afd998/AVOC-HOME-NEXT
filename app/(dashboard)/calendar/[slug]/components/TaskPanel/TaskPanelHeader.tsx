"use client";

import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";

type TaskPanelHeaderProps = {
  onGoToNow?: () => void;
  goNowDisabled?: boolean;
};

export default function TaskPanelHeader({
  onGoToNow,
  goNowDisabled = false,
}: TaskPanelHeaderProps) {
  return (
    <header className="border-b px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold leading-none">Task View</h2>
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
