"use client";

import { useCallback, useEffect } from "react";
import ActionContent from "@/core/actions/ActionContent";
import { useCalendarActionsStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarActionsStore";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { Card } from "@/components/ui/card";

type ActionContentWrapperProps = {
  actionId: string;
  initialAction: HydratedAction;
};

export default function ActionContentWrapper({
  actionId,
  initialAction,
}: ActionContentWrapperProps) {
  const updateAction = useCalendarActionsStore((state) => state.updateAction);

  // Get action from store (will be updated by real-time updates)
  const action = useCalendarActionsStore(
    useCallback(
      (state) => {
        const numericId = Number(actionId);
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
      [actionId]
    )
  );

  // Add initial action to store if provided
  useEffect(() => {
    updateAction(initialAction);
  }, [initialAction, updateAction]);

  // Use action from store if available, otherwise fall back to initialAction
  const currentAction = action ?? initialAction;

  return (
    <Card className="flex flex-col h-full overflow-hidden px-0 md:px-6 lg:px-8 xl:px-10">
      <ActionContent action={currentAction} />{" "}
    </Card>
  );
}
