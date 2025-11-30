import { useCallback, useState } from "react";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { useActionMutations } from "@/lib/query";

export function useActionCompletion(action: HydratedAction) {
  const { updateAction } = useActionMutations();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = action.status.trim().toLowerCase() === "completed";
  const numericActionId = action.id;

  const handleMarkCompleted = useCallback(async () => {
    if (isCompleted || isCompleting) {
      return;
    }

    const previousAction = action;

    setIsCompleting(true);
    setErrorMessage(null);
    updateAction({
      ...action,
      status: "COMPLETED",
      completedTime: new Date().toISOString(),
      completedByProfile: action.completedByProfile ?? null,
    });

    try {
      // TODO: Implement markActionCompletedAction similar to markTaskCompletedAction
      // const result = await markActionCompletedAction({
      //   actionId: numericActionId,
      // });
      //
      // if (!result.success) {
      //   setErrorMessage(result.error);
      //   updateAction(previousAction);
      //   return;
      // }
      //
      // if (result.action) {
      //   updateAction(result.action);
      // }
      setErrorMessage(null);
    } catch (error) {
      try {
        console.error("[ActionModal] Failed to mark action completed", error);
      } catch {
        // noop: console may fail in edge cases
      }
      setErrorMessage("Unable to mark action as completed.");
      updateAction(previousAction);
    } finally {
      setIsCompleting(false);
    }
  }, [updateAction, isCompleted, isCompleting, action, numericActionId]);

  return {
    isCompleted,
    isCompleting,
    errorMessage,
    handleMarkCompleted,
  };
}
