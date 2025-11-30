"use client";

import { useCallback } from "react";
import { ArrowDown, UserPlus, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventAssignmentsStore } from "@/lib/stores/event-assignments";

type ActionPanelHeaderProps = {
  onGoToNow?: () => void;
  goNowDisabled?: boolean;
  totalActions: number;
  tabValue: "all" | "mine";
  onTabValueChange?: (value: "all" | "mine") => void;
  onOpenSchedule?: () => void;
};

export default function ActionPanelHeader({
  onGoToNow,
  goNowDisabled = false,
  totalActions,
  tabValue,
  onTabValueChange,
  onOpenSchedule,
}: ActionPanelHeaderProps) {
  const { showEventAssignments, toggleEventAssignments } = useEventAssignmentsStore();
  const handleTabValueChange = useCallback(
    (nextValue: string) => {
      if (nextValue === "all" || nextValue === "mine") {
        onTabValueChange?.(nextValue);
      }
    },
    [onTabValueChange]
  );

  return (
    <header className="border-b px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold leading-none">Action View</h2>
          <div className="flex items-center gap-2">
            {!showEventAssignments && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEventAssignments}
                aria-label="Show assignments"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assignments
              </Button>
            )}
            {showEventAssignments && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSchedule}
                  aria-label="Open schedule"
                >
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button
                  variant={showEventAssignments ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleEventAssignments}
                  aria-label="Hide assignments"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Tabs
            value={tabValue}
            onValueChange={handleTabValueChange}
            className="flex-1"
          >
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="all">All Actions</TabsTrigger>
              <TabsTrigger value="mine">My Actions</TabsTrigger>
            </TabsList>
          </Tabs>
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
        <div className="space-y-1"></div>
      </div>
    </header>
  );
}
