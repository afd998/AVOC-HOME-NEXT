"use client";

import { create } from "zustand";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

export type ActionGroup = {
  roomName: string;
  actions: HydratedAction[];
};

type CalendarActionsState = {
  actionGroups: ActionGroup[];
  date: string | null;
  filter: string | null;
  autoHide: boolean;
  setInitialData: (payload: {
    actionGroups: ActionGroup[];
    date: string;
    filter: string;
    autoHide: boolean;
  }) => void;
  setActionGroups: (actionGroups: ActionGroup[]) => void;
  updateAction: (action: HydratedAction) => void;
};

const defaultState: Omit<CalendarActionsState, "setInitialData" | "setActionGroups" | "updateAction"> = {
  actionGroups: [],
  date: null,
  filter: null,
  autoHide: false,
};

export const useCalendarActionsStore = create<CalendarActionsState>((set) => ({
  ...defaultState,
  setInitialData: ({ actionGroups, date, filter, autoHide }) =>
    set({
      actionGroups,
      date,
      filter,
      autoHide,
    }),
  setActionGroups: (actionGroups) =>
    set({
      actionGroups,
    }),
  updateAction: (action) =>
    set((state) => {
      const numericId =
        typeof action.id === "string" ? Number.parseInt(action.id, 10) : action.id;

      if (numericId == null || Number.isNaN(numericId)) {
        return state;
      }

      const existingGroupIndex = state.actionGroups.findIndex(
        (group) => group.roomName === action.room
      );

      const insertActionIntoGroup = (group: ActionGroup): ActionGroup => {
        const existingActionIndex = group.actions.findIndex(
          (existingAction) => existingAction.id === numericId
        );

        const updatedActions =
          existingActionIndex === -1
            ? [...group.actions, action]
            : group.actions.map((existingAction) =>
                existingAction.id === numericId ? action : existingAction
              );

        updatedActions.sort((a, b) => {
          const aStart = a.derived?.startMinutes ?? 0;
          const bStart = b.derived?.startMinutes ?? 0;
          return aStart - bStart;
        });

        return {
          ...group,
          actions: updatedActions,
        };
      };

      if (existingGroupIndex === -1) {
        const newGroup: ActionGroup = insertActionIntoGroup({
          roomName: action.room,
          actions: [],
        });
        return {
          ...state,
          actionGroups: [...state.actionGroups, newGroup],
        };
      }

      const group = state.actionGroups[existingGroupIndex];
      const updatedGroup = insertActionIntoGroup(group);

      const updatedActionGroups = [...state.actionGroups];
      updatedActionGroups[existingGroupIndex] = updatedGroup;

      return {
        ...state,
        actionGroups: updatedActionGroups,
      };
    }),
}));

