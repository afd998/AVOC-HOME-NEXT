"use client";

import { create } from "zustand";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

export type TaskGroup = {
  roomName: string;
  tasks: HydratedTask[];
};

type CalendarTasksState = {
  taskGroups: TaskGroup[];
  date: string | null;
  filter: string | null;
  autoHide: boolean;
  setInitialData: (payload: {
    taskGroups: TaskGroup[];
    date: string;
    filter: string;
    autoHide: boolean;
  }) => void;
  setTaskGroups: (taskGroups: TaskGroup[]) => void;
  updateTask: (task: HydratedTask) => void;
};

const defaultState: Omit<CalendarTasksState, "setInitialData" | "setTaskGroups" | "updateTask"> = {
  taskGroups: [],
  date: null,
  filter: null,
  autoHide: false,
};

export const useCalendarTasksStore = create<CalendarTasksState>((set) => ({
  ...defaultState,
  setInitialData: ({ taskGroups, date, filter, autoHide }) =>
    set({
      taskGroups,
      date,
      filter,
      autoHide,
    }),
  setTaskGroups: (taskGroups) =>
    set({
      taskGroups,
    }),
  updateTask: (task) =>
    set((state) => {
      const numericId =
        typeof task.id === "string" ? Number.parseInt(task.id, 10) : task.id;

      if (numericId == null || Number.isNaN(numericId)) {
        return state;
      }

      const existingGroupIndex = state.taskGroups.findIndex(
        (group) => group.roomName === task.room
      );

      const insertTaskIntoGroup = (group: TaskGroup): TaskGroup => {
        const existingTaskIndex = group.tasks.findIndex(
          (existingTask) => existingTask.id === numericId
        );

        const updatedTasks =
          existingTaskIndex === -1
            ? [...group.tasks, task]
            : group.tasks.map((existingTask) =>
                existingTask.id === numericId ? task : existingTask
              );

        updatedTasks.sort((a, b) => {
          const aStart = a.derived?.startMinutes ?? 0;
          const bStart = b.derived?.startMinutes ?? 0;
          return aStart - bStart;
        });

        return {
          ...group,
          tasks: updatedTasks,
        };
      };

      if (existingGroupIndex === -1) {
        const newGroup: TaskGroup = insertTaskIntoGroup({
          roomName: task.room,
          tasks: [],
        });
        return {
          ...state,
          taskGroups: [...state.taskGroups, newGroup],
        };
      }

      const group = state.taskGroups[existingGroupIndex];
      const updatedGroup = insertTaskIntoGroup(group);

      const updatedTaskGroups = [...state.taskGroups];
      updatedTaskGroups[existingGroupIndex] = updatedGroup;

      return {
        ...state,
        taskGroups: updatedTaskGroups,
      };
    }),
}));
