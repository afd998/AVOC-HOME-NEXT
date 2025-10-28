"use client";

import { useMemo } from "react";

import TaskEmptyState from "./TaskEmptyState";
import TaskList from "./TaskList";
import TaskPanelHeader from "./TaskPanelHeader";
import { buildTaskListItems } from "./utils";
import { useCalendarTasksStore } from "../../stores/useCalendarTasksStore";

export default function TaskPanel() {
  const taskGroups = useCalendarTasksStore((state) => state.taskGroups);

  const { items, totalTasks } = useMemo(
    () => buildTaskListItems(taskGroups),
    [taskGroups]
  );

  return (
    <div className="flex h-full flex-col">
      <TaskPanelHeader />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {totalTasks === 0 ? <TaskEmptyState /> : <TaskList items={items} />}
      </div>
    </div>
  );
}
