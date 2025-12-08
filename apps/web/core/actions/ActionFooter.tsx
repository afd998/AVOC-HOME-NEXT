import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import UserAvatar from "@/core/User/UserAvatar";
import { getProfileDisplayName } from "@/core/User/utils";
import { formatDateTime } from "@/app/utils/dateTime";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

interface ActionFooterProps {
  action: HydratedAction;
  isCompleted: boolean;
  isCompleting: boolean;
  canCompleteAction: boolean;
  onMarkCompleted: () => void;
}

export default function ActionFooter({
  action,
  isCompleted,
  isCompleting,
  canCompleteAction,
  onMarkCompleted,
}: ActionFooterProps) {
  const completedByProfile = action.completedByProfile ?? null;
  const completedByDisplayName = getProfileDisplayName(completedByProfile);
  const disableUntilStart = !canCompleteAction && !isCompleted;
  const buttonDisabled = isCompleting || isCompleted || disableUntilStart;
  const disabledVisualClasses = disableUntilStart
    ? "opacity-60 cursor-not-allowed"
    : isCompleted
      ? "opacity-100"
      : "";

  return (
    <CardFooter className="flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:gap-4 sm:justify-between shrink-0">
      {isCompleted &&
      (completedByDisplayName ||
        (action.completedTime
          ? `Completed ${formatDateTime(action.completedTime)}`
          : "Completed")) ? (
        <div className="flex items-center gap-3">
          {completedByProfile ? (
            <div className="flex items-center gap-2">
              <UserAvatar
                profile={completedByProfile}
                size="sm"
                variant="solid"
                className="border border-emerald-200 shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Completed by
                </span>
                <span className="text-sm font-medium text-foreground">
                  {completedByDisplayName}
                </span>
              </div>
            </div>
          ) : null}
          {action.completedTime ? (
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Completed {formatDateTime(action.completedTime)}
            </span>
          ) : (
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Completed
            </span>
          )}
        </div>
      ) : null}
      <Button
        type="button"
        onClick={onMarkCompleted}
        disabled={buttonDisabled}
        title={disableUntilStart ? "Available once the action starts." : undefined}
        variant="secondary"
        className={`w-full justify-center gap-2 bg-emerald-600 text-emerald-50 hover:bg-emerald-700 focus-visible:ring-emerald-500 disabled:bg-emerald-600 disabled:text-emerald-50 sm:w-auto sm:ml-auto ${disabledVisualClasses}`}
      >
        {isCompleting && !isCompleted ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Marking...
          </>
        ) : (
          <>
            <Check className="size-4" />
            {isCompleted ? "Completed" : "Mark Complete"}
          </>
        )}
      </Button>
    </CardFooter>
  );
}
