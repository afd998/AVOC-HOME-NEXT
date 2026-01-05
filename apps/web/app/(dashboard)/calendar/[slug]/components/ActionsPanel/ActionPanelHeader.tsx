"use client";

import { useCallback, useMemo } from "react";
import { ArrowDown, UserPlus, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventAssignmentsStore } from "@/lib/stores/event-assignments";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

type ActionPanelHeaderProps = {
  date: string;
  onGoToNow?: () => void;
  goNowDisabled?: boolean;
  totalActions: number;
  tabValue: "all" | "mine";
  onTabValueChange?: (value: "all" | "mine") => void;
  onOpenSchedule?: () => void;
  enableAssignments?: boolean;
};

export default function ActionPanelHeader({
  date,
  onGoToNow,
  goNowDisabled = false,
  totalActions,
  tabValue,
  onTabValueChange,
  onOpenSchedule,
  enableAssignments = true,
}: ActionPanelHeaderProps) {
  const { showEventAssignments, toggleEventAssignments } = useEventAssignmentsStore();
  const assignmentsEnabled = enableAssignments;
  const assignmentsOpen = assignmentsEnabled && showEventAssignments;

  const handleToggleAssignments = useCallback(() => {
    if (!assignmentsEnabled) return;
    toggleEventAssignments();
  }, [assignmentsEnabled, toggleEventAssignments]);
  const handleTabValueChange = useCallback(
    (nextValue: string) => {
      if (nextValue === "all" || nextValue === "mine") {
        onTabValueChange?.(nextValue);
      }
    },
    [onTabValueChange]
  );

  const formattedDate = useMemo(() => {
    const [year, month, day] = date.split("-").map(Number);
    if ([year, month, day].some((value) => Number.isNaN(value))) {
      return date;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed);
  }, [date]);

  return (
    <header className="border-b px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold leading-none">Actions</h2>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            {assignmentsEnabled && !assignmentsOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAssignments}
                aria-label="Show assignments"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assignments
              </Button>
            )}
            {assignmentsEnabled && assignmentsOpen && (
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
                  variant={assignmentsOpen ? "default" : "ghost"}
                  size="sm"
                  onClick={handleToggleAssignments}
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
