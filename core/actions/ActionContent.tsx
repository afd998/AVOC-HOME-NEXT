"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Icon } from "@iconify/react";
import UserAvatar from "@/core/User/UserAvatar";
import CaptureQC, { useCaptureQCForm } from "@/core/tasks/CaptureQC";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { useCalendarActionsStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarActionsStore";
import {
  formatDate as formatActionDate,
  formatTime as formatActionTime,
  formatDateTime,
} from "@/app/utils/dateTime";
import { getProfileDisplayName } from "@/core/User/utils";

type ActionContentProps = {
  action: HydratedAction;
};

// Simple icon mapping for action types
function getActionIcon(action: HydratedAction) {
  const type = action.type?.toUpperCase() || "";
  const subType = action.subType?.toUpperCase() || "";
  
  if (type.includes("CONFIG") || subType.includes("CONFIG")) {
    return "mdi:cog";
  }
  if (type.includes("CAPTURE") || subType.includes("CAPTURE") || type.includes("RECORDING")) {
    return "mdi:video";
  }
  if (type.includes("STAFF") || subType.includes("STAFF") || type.includes("ASSISTANCE")) {
    return "mdi:account-group";
  }
  
  return "mdi:check-circle";
}

export default function ActionContent({ action: actionProp }: ActionContentProps) {
  const updateAction = useCalendarActionsStore((state) => state.updateAction);

  // Use the action from props
  const action = actionProp;
  const numericActionId = action.id;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = action.status.trim().toLowerCase() === "completed";
  const completedByProfile = action.completedByProfile ?? null;

  // All actions can have QC items, so always show the QC form if there are qcItems
  const hasQcItems = action.qcItems && action.qcItems.length > 0;

  // Get QC form instance if available (will be null if form not mounted)
  const qcForm = useCaptureQCForm();

  // Update Zustand store when real-time updates occur
  // TODO: Implement real-time updates for actions similar to tasks
  const handleRealtimeUpdate = useCallback(async () => {
    try {
      const response = await fetch(`/api/actions/${numericActionId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload: { action: HydratedAction | null } = await response.json();
      if (payload.action) {
        updateAction(payload.action);
      }
    } catch (error) {
      console.error(
        "[ActionModal] Failed to refresh action from real-time update",
        error
      );
    }
  }, [updateAction, numericActionId]);

  // TODO: Set up real-time subscription for action
  // useActionRealtime(numericActionId, handleRealtimeUpdate);

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

  const actionDate = action.eventDetails?.date ?? "";
  const formattedDate = formatActionDate(actionDate);
  const formattedTime = formatActionTime(action.startTime);
  const formattedStatus = action.status.trim() || "No status set";
  const hasStatus = action.status.trim().length > 0;
  const statusVariant = (() => {
    switch (action.status.trim().toLowerCase()) {
      case "completed":
        return "affirmative";
      case "cancelled":
      case "canceled":
        return "destructive";
      case "in progress":
      case "processing":
        return "secondary";
      default:
        return "outline";
    }
  })();
  const completedByDisplayName = getProfileDisplayName(completedByProfile);

  const eventLink = action.eventDetails
    ? `/events/${action.eventDetails.id}`
    : null;

  const resourceEvents = action.eventDetails?.resourceEvents ?? [];
  const instructionEntries = resourceEvents
    .map((resourceEvent) => resourceEvent.instructions?.trim())
    .filter((value): value is string => !!value && value.length > 0);
  const hasInstructions = instructionEntries.length > 0;

  const actionDetails: Array<{ label: string; value: ReactNode; href?: string }> =
    [{ label: "Venue", value: action.room }];

  if (action.eventDetails) {
    const details = action.eventDetails;
    const eventTitle = details.eventName.trim() || "Linked Event";
    const dateLabel = formatActionDate(details.date);
    const startLabel = details.startTime
      ? formatActionTime(details.startTime)
      : null;
    const endLabel = details.endTime ? formatActionTime(details.endTime) : null;
    const eventTimingLabel =
      startLabel && endLabel
        ? `${dateLabel} · ${startLabel} - ${endLabel}`
        : null;

    actionDetails.push({
      label: "Event",
      value: (
        <>
          <span className="font-medium text-foreground">{eventTitle}</span>
          {eventTimingLabel ? (
            <span className="block text-xs text-muted-foreground">
              {eventTimingLabel}
            </span>
          ) : null}
        </>
      ),
      href: eventLink ?? undefined,
    });
  }

  const iconName = getActionIcon(action);
  const displayName = action.subType?.trim() || action.type?.trim() || "Action";

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="gap-4 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background">
              <Icon
                icon={iconName}
                width={48}
                height={48}
                className="h-12 w-12 p-3 text-muted-foreground"
              />
            </span>
            <div className="flex flex-col gap-1 text-left">
              <CardTitle className="text-xl font-semibold">
                {displayName}
              </CardTitle>
              <CardDescription>
                {formattedDate} | {formattedTime}
              </CardDescription>
            </div>
          </div>
          {hasStatus ? (
            <Badge variant={statusVariant} className="uppercase tracking-wide">
              {formattedStatus}
            </Badge>
          ) : null}
        </div>
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-6 pt-0">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Action Details
          </h3>
          <ItemGroup className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {actionDetails.map(({ label, value, href }) => {
              const content = (
                <ItemContent className="flex flex-col gap-1">
                  <ItemTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </ItemTitle>
                  <ItemDescription className="text-sm font-medium text-foreground">
                    {value}
                  </ItemDescription>
                </ItemContent>
              );

              if (href) {
                return (
                  <Item
                    key={label}
                    variant="outline"
                    size="sm"
                    className="flex w-full flex-col gap-2"
                    asChild
                  >
                    <Link href={href}>{content}</Link>
                  </Item>
                );
              }

              return (
                <Item
                  key={label}
                  variant="outline"
                  size="sm"
                  className="flex w-full flex-col gap-2"
                >
                  {content}
                </Item>
              );
            })}
          </ItemGroup>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Instructions
          </h3>
          {hasInstructions ? (
            <div className="flex flex-col gap-3">
              {instructionEntries.map((text, index) => (
                <p
                  key={`instruction-${index}`}
                  className="whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground"
                >
                  {text}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No instructions provided for this action.
            </p>
          )}
        </section>

        {/* Always show QC items section for all actions */}
        <CaptureQC
          task={
            {
              ...action,
              // Adapt action structure to match what CaptureQC expects
              // CaptureQC expects task.captureQcDetails.qcItems where each item has a 'qc' field
              captureQcDetails: hasQcItems
                ? {
                    qcItems: action.qcItems.map((item) => ({
                      ...item,
                      qc: action.id, // Use action ID as qc reference (CaptureQC expects item.qc)
                      qcItemDict: item.qcItemDict ?? {
                        id: 0,
                        displayName: "",
                        instruction: "",
                        createdAt: "",
                      },
                    })),
                  }
                : null,
            } as any
          }
        />
      </CardContent>

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
          onClick={handleMarkCompleted}
          disabled={isCompleting || isCompleted}
          variant="secondary"
          className={`w-full justify-center gap-2 bg-emerald-600 text-emerald-50 hover:bg-emerald-700 focus-visible:ring-emerald-500 disabled:bg-emerald-600 disabled:text-emerald-50 disabled:opacity-100 sm:w-auto sm:ml-auto ${
            isCompleted ? "opacity-100" : ""
          }`}
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
    </Card>
  );
}

