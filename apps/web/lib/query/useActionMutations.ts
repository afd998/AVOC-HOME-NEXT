"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import type { ActionGroup } from "./useActionsQuery";
import { actionPanelQueryKey } from "./useActionsQuery";

/**
 * Hook for updating actions in the React Query cache.
 * Provides optimistic update capabilities for actions.
 */
export function useActionMutations() {
  const queryClient = useQueryClient();

  const updateAction = useCallback(
    (action: HydratedAction) => {
      // Get all cached action queries
      const cache = queryClient.getQueryCache();
      const queries = cache.findAll({
        queryKey: ["actionpanel"],
      });

      // Update the action in all relevant caches
      for (const query of queries) {
        const queryKey = query.queryKey as ReturnType<typeof actionPanelQueryKey>;
        
        queryClient.setQueryData<ActionGroup[]>(queryKey, (oldData) => {
          if (!oldData) return oldData;

          const numericId =
            typeof action.id === "string"
              ? Number.parseInt(action.id, 10)
              : action.id;

          if (numericId == null || Number.isNaN(numericId)) {
            return oldData;
          }

          // Find the group for this action
          const existingGroupIndex = oldData.findIndex(
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
            return [...oldData, newGroup];
          }

          const group = oldData[existingGroupIndex];
          const updatedGroup = insertActionIntoGroup(group);

          const updatedActionGroups = [...oldData];
          updatedActionGroups[existingGroupIndex] = updatedGroup;

          return updatedActionGroups;
        });
      }
    },
    [queryClient]
  );

  const findActionById = useCallback(
    (actionId: number): HydratedAction | null => {
      const cache = queryClient.getQueryCache();
      const queries = cache.findAll({
        queryKey: ["actionpanel"],
      });

      for (const query of queries) {
        const data = query.state.data as ActionGroup[] | undefined;
        if (!data) continue;

        for (const group of data) {
          const match = group.actions.find((action) => action.id === actionId);
          if (match) {
            return match;
          }
        }
      }

      return null;
    },
    [queryClient]
  );

  return {
    updateAction,
    findActionById,
  };
}

