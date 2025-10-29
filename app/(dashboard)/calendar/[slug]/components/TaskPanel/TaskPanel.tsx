"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TaskEmptyState from "./TaskEmptyState";
import TaskList from "./TaskList";
import TaskPanelHeader from "./TaskPanelHeader";
import { buildTaskListItems } from "./utils";
import { useCalendarTasksStore } from "../../stores/useCalendarTasksStore";

export default function TaskPanel() {
  const taskGroups = useCalendarTasksStore((state) => state.taskGroups);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const indicatorElementRef = useRef<HTMLDivElement | null>(null);
  const [hasIndicator, setHasIndicator] = useState(false);

  const { items, totalTasks } = useMemo(
    () => buildTaskListItems(taskGroups),
    [taskGroups]
  );

  useEffect(() => {
    if (totalTasks === 0) {
      indicatorElementRef.current = null;
      setHasIndicator(false);
    }
  }, [totalTasks]);

  const handleIndicatorUpdate = useCallback(
    (element: HTMLDivElement | null) => {
      indicatorElementRef.current = element;
      setHasIndicator(Boolean(element));
    },
    []
  );

  const handleGoToNow = useCallback(() => {
    const container = scrollContainerRef.current;
    const indicator = indicatorElementRef.current;
    if (!container || !indicator) return;

    const containerRect = container.getBoundingClientRect();
    const indicatorRect = indicator.getBoundingClientRect();
    const relativePosition = indicatorRect.top - containerRect.top;
    const desiredOffset = container.clientHeight * 0.25;
    const targetScrollTop =
      container.scrollTop + relativePosition - desiredOffset;

    container.scrollTo({
      top: Math.max(targetScrollTop, 0),
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="flex h-full flex-col">
      <TaskPanelHeader
        onGoToNow={handleGoToNow}
        goNowDisabled={!hasIndicator}
      />
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {totalTasks === 0 ? (
          <TaskEmptyState />
        ) : (
          <TaskList items={items} onIndicatorUpdate={handleIndicatorUpdate} />
        )}
      </div>
    </div>
  );
}
