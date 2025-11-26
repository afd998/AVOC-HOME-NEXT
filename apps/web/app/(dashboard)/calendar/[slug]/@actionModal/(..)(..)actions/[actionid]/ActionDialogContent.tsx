"use client";

import { useCallback, useEffect } from "react";
import ActionContent from "@/core/actions/ActionContent";
import { useCalendarActionsStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarActionsStore";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

type ActionDialogContentProps = {
  actionId: string;
  slug: string;
  initialAction: HydratedAction | null;
};

export default function ActionDialogContent({
  initialAction,
  ...props
}: ActionDialogContentProps) {
  const updateAction = useCalendarActionsStore((state) => state.updateAction);
  // Get action from store (will be updated by real-time updates)
  const action = useCalendarActionsStore(
    useCallback(
      (state) => {
        const numericId = Number(props.actionId);
        if (!Number.isInteger(numericId)) {
          return null;
        }
        for (const group of state.actionGroups) {
          const match = group.actions.find((action) => action.id === numericId);
          if (match) {
            return match;
          }
        }
        return null;
      },
      [props.actionId]
    )
  );

  // Add initial action to store if provided
  useEffect(() => {
    if (initialAction) {
      updateAction(initialAction);
    }
  }, [initialAction, updateAction]);

  // Use action from store if available, otherwise fall back to initialAction
  const currentAction = action ?? initialAction;

  if (!currentAction) {
    return null;
  }

  return <ActionContent action={currentAction} />;
}

