import { useCallback, useEffect, useMemo, useState } from "react";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { useActionMutations } from "@/lib/query";
import { supabase } from "@/lib/supabase";

function getActionStartTimestamp(action: HydratedAction): number | null {
  const date = action.eventDetails?.date;
  const startTime = action.startTime;

  if (!date || !startTime) {
    return null;
  }

  const normalizedTime =
    startTime.length === 5 ? `${startTime}:00` : startTime;
  const timestamp = Date.parse(`${date}T${normalizedTime}`);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return timestamp;
}

export function useActionCompletion(action: HydratedAction) {
  const { updateAction } = useActionMutations();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const normalizedStatus = action.status?.trim().toLowerCase() ?? "";
  const isCompleted = normalizedStatus === "completed";

  const actionStartTimestamp = useMemo(
    () => getActionStartTimestamp(action),
    [action.eventDetails?.date, action.startTime]
  );

  const [hasStarted, setHasStarted] = useState(() => {
    if (actionStartTimestamp == null) {
      return true;
    }
    return Date.now() >= actionStartTimestamp;
  });

  useEffect(() => {
    if (actionStartTimestamp == null) {
      setHasStarted(true);
      return;
    }

    const checkAndUpdate = () => {
      const started = Date.now() >= actionStartTimestamp;
      setHasStarted(started);
      return started;
    };

    if (checkAndUpdate()) {
      return;
    }

    const MAX_DELAY = 2147483647;
    let timeoutId: number | null = null;

    const scheduleCheck = () => {
      const remaining = actionStartTimestamp - Date.now();
      if (remaining <= 0) {
        setHasStarted(true);
        timeoutId = null;
        return;
      }

      timeoutId = window.setTimeout(() => {
        scheduleCheck();
      }, Math.min(remaining, MAX_DELAY));
    };

    scheduleCheck();

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [actionStartTimestamp]);

  const handleMarkCompleted = useCallback(async () => {
    if (isCompleted || isCompleting) {
      return;
    }

    if (!hasStarted) {
      setErrorMessage("You can mark this action complete once it has started.");
      return;
    }

    const numericActionId =
      typeof action.id === "string" ? Number.parseInt(action.id, 10) : action.id;

    if (!numericActionId || Number.isNaN(numericActionId)) {
      setErrorMessage("Invalid action id.");
      return;
    }

    const previousAction = action;

    setIsCompleting(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user?.id) {
        throw new Error("You must be signed in to complete actions.");
      }

      const completionTimestamp = new Date().toISOString();

      updateAction({
        ...action,
        status: "COMPLETED",
        completedTime: completionTimestamp,
        completedBy: user.id,
        completedByProfile: action.completedByProfile ?? null,
      });

      const response = await fetch(`/api/actions/${numericActionId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completedBy: user.id,
          completedTime: completionTimestamp,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to mark action as completed.";
        throw new Error(message);
      }

      if (payload?.action) {
        updateAction(payload.action);
      }

      setErrorMessage(null);
    } catch (error) {
      try {
        console.error("[ActionModal] Failed to mark action completed", error);
      } catch {
        // noop: console may fail in edge cases
      }
      updateAction(previousAction);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to mark action as completed.";
      setErrorMessage(message);
    } finally {
      setIsCompleting(false);
    }
  }, [action, hasStarted, isCompleted, isCompleting, updateAction]);

  return {
    isCompleted,
    isCompleting,
    errorMessage,
    canCompleteAction: hasStarted,
    handleMarkCompleted,
  };
}
