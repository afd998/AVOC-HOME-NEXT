"use client";

import { useCallback, useEffect } from "react";
import TaskContent from "@/core/tasks/TaskContent";
import { useCalendarTasksStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarTasksStore";
import type { HydratedTask } from "@/lib/data/calendar/taskUtils";

type TaskDialogContentProps = {
  taskId: string;
  slug: string;
  initialTask: HydratedTask | null;
};

export default function TaskDialogContent({
  initialTask,
  ...props
}: TaskDialogContentProps) {
  const updateTask = useCalendarTasksStore((state) => state.updateTask);
  // Get task from store (will be updated by real-time updates)
  const task = useCalendarTasksStore(
    useCallback(
      (state) => {
        const numericId = Number(props.taskId);
        if (!Number.isInteger(numericId)) {
          return null;
        }
        for (const group of state.taskGroups) {
          const match = group.tasks.find((task) => task.id === numericId);
          if (match) {
            return match;
          }
        }
        return null;
      },
      [props.taskId]
    )
  );

  // Add initial task to store if provided
  useEffect(() => {
    if (initialTask) {
      updateTask(initialTask);
    }
  }, [initialTask, updateTask]);

  // Use task from store if available, otherwise fall back to initialTask
  const currentTask = task ?? initialTask;

  if (!currentTask) {
    return null;
  }

  return <TaskContent task={currentTask} />;
}
