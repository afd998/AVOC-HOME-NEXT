"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TaskEmptyState from "./TaskEmptyState";
import TaskList from "./TaskList";
import TaskPanelHeader from "./TaskPanelHeader";
import { TaskOverdueKeyframes } from "./taskOverdueStyles";
import { buildTaskListItems } from "./utils";
import { useCalendarTasksStore } from "../../stores/useCalendarTasksStore";

export default function TaskPanel() {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const taskGroups = useCalendarTasksStore((state) => state.taskGroups);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const indicatorElementRef = useRef<HTMLDivElement | null>(null);
  const [hasIndicator, setHasIndicator] = useState(false);

  const { items, totalTasks } = useMemo(() => {
    if (activeTab !== "all") {
      return { items: [], totalTasks: 0 };
    }
    return buildTaskListItems(taskGroups);
  }, [activeTab, taskGroups]);

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
    <>
      <TaskOverdueKeyframes />
      <div className="flex h-full flex-col">
        <TaskPanelHeader
          onGoToNow={handleGoToNow}
          goNowDisabled={activeTab !== "all" || !hasIndicator}
          tabValue={activeTab}
          onTabValueChange={setActiveTab}
          totalTasks={totalTasks}
        />
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {activeTab === "all" ? (
            totalTasks === 0 ? (
              <TaskEmptyState />
            ) : (
              <TaskList
                items={items}
                onIndicatorUpdate={handleIndicatorUpdate}
              />
            )
          ) : null}
        </div>
      </div>
    </>
  );
}
