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
import { TaskIcon } from "@/core/tasks/taskIcon";
import UserAvatar from "@/core/User/UserAvatar";
import CaptureQC, { useCaptureQCForm } from "@/core/tasks/CaptureQC";
import { transformFormValuesToQcItems } from "@/core/tasks/captureQcUtils";
import type { QCItemInsert } from "@/app/(dashboard)/calendar/[slug]/@taskModal/(..)(..)tasks/[taskid]/actions";
import type { HydratedTask } from "@/lib/data/calendar/taskUtils";
import { useCalendarTasksStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarTasksStore";
import { markTaskCompletedAction } from "@/app/(dashboard)/calendar/[slug]/@taskModal/(..)(..)tasks/[taskid]/actions";
import {
  formatDate as formatTaskDate,
  formatTime as formatTaskTime,
  formatDateTime,
} from "@/app/utils/dateTime";
import { useTaskRealtime, useCaptureQCRealtime } from "@/core/tasks/hooks/useTaskRealtime";
import { getProfileDisplayName } from "@/core/User/utils";

type TaskContentProps = {
  task: HydratedTask;
};

export default function TaskContent({ task: taskProp }: TaskContentProps) {
  const updateTask = useCalendarTasksStore((state) => state.updateTask);

  // Use the task from props
  const task = taskProp;
  const numericTaskId = task.id;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = task.status.trim().toLowerCase() === "completed";
  const completedByProfile = task.completedByProfile ?? null;

  // Check if this is a CaptureQC task
  const shouldShowCaptureQC = (() => {
    const taskType = task.taskType;
    if (!taskType) {
      return false;
    }
    return taskType.trim().toUpperCase() === "RECORDING CHECK";
  })();

  // Get QC form instance if available (will be null if not CaptureQC or form not mounted)
  const qcForm = useCaptureQCForm();

  // Update Zustand store when real-time updates occur
  // Fetch from API route which handles hydration on the server
  const handleRealtimeUpdate = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${numericTaskId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload: { task: HydratedTask | null } = await response.json();
      if (payload.task) {
        updateTask(payload.task);
      }
    } catch (error) {
      console.error(
        "[TaskModal] Failed to refresh task from real-time update",
        error
      );
    }
  }, [updateTask, numericTaskId]);

  // Set up real-time subscription for task
  useTaskRealtime(numericTaskId, handleRealtimeUpdate);

  // Set up real-time subscription for QC items if this is a CaptureQC task
  useCaptureQCRealtime(numericTaskId, handleRealtimeUpdate);

  const handleMarkCompleted = useCallback(async () => {
    if (isCompleted || isCompleting) {
      return;
    }

    const previousTask = task;
    
    // Validate QC form if present
    if (shouldShowCaptureQC && qcForm) {
      const isValid = await qcForm.trigger();
      if (!isValid) {
        setErrorMessage("Please complete all required QC fields before marking as complete.");
        return;
      }
    }

    // Get QC items data if form exists
    let qcItemsData: QCItemInsert[] | undefined;
    if (shouldShowCaptureQC && qcForm) {
      const formValues = qcForm.getValues();
      qcItemsData = transformFormValuesToQcItems(formValues, numericTaskId);
    }

    // Create optimistic task update
    const optimisticTask: HydratedTask = {
      ...task,
      status: "COMPLETED",
      completedTime: new Date().toISOString(),
      completedByProfile: task.completedByProfile ?? null,
    };

    // Note: QC data will be updated from server response after save
    // We're not doing optimistic QC update to avoid complex type issues
    // The server response will include updated QC items

    setIsCompleting(true);
    setErrorMessage(null);
    updateTask(optimisticTask);

    try {
      const result = await markTaskCompletedAction({
        taskId: numericTaskId,
        date: task.date ?? new Date().toISOString(),
        qcItemsData,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        updateTask(previousTask);
        return;
      }

      if (result.task) {
        updateTask(result.task);
      }
      setErrorMessage(null);
    } catch (error) {
      try {
        console.error("[TaskModal] Failed to mark task completed", error);
      } catch {
        // noop: console may fail in edge cases
      }
      setErrorMessage("Unable to mark task as completed.");
      updateTask(previousTask);
    } finally {
      setIsCompleting(false);
    }
  }, [updateTask, isCompleted, isCompleting, task, shouldShowCaptureQC, numericTaskId, qcForm]);

  const formattedDate = formatTaskDate(task.date ?? "");
  const formattedTime = formatTaskTime(task.startTime);
  const formattedStatus = task.status.trim() || "No status set";
  const hasStatus = task.status.trim().length > 0;
  const statusVariant = (() => {
    switch (task.status.trim().toLowerCase()) {
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

  const eventLink = task.eventDetails
    ? `/events/${task.eventDetails.id}`
    : null;

  const resourceEvents = task.eventDetails?.resourceEvents ?? [];
  const instructionEntries = resourceEvents
    .map((resourceEvent) => resourceEvent.instructions?.trim())
    .filter((value): value is string => !!value && value.length > 0);
  const hasInstructions = instructionEntries.length > 0;

  const taskDetails: Array<{ label: string; value: ReactNode; href?: string }> =
    [{ label: "Venue", value: task.room }];

  if (task.eventDetails) {
    const details = task.eventDetails;
    const eventTitle = details.eventName.trim() || "Linked Event";
    const dateLabel = formatTaskDate(details.date);
    const startLabel = details.startTime
      ? formatTaskTime(details.startTime)
      : null;
    const endLabel = details.endTime ? formatTaskTime(details.endTime) : null;
    const eventTimingLabel =
      startLabel && endLabel
        ? `${dateLabel} · ${startLabel} - ${endLabel}`
        : null;

    taskDetails.push({
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

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="gap-4 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background">
              <TaskIcon task={task} className="h-12 w-12 p-3" />
            </span>
            <div className="flex flex-col gap-1 text-left">
              <CardTitle className="text-xl font-semibold">
                {(task.taskDictDetails?.displayName || "Task").trim()}
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
            Task Details
          </h3>
          <ItemGroup className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {taskDetails.map(({ label, value, href }) => {
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
              No instructions provided for this task.
            </p>
          )}
        </section>

        {shouldShowCaptureQC ? <CaptureQC task={task} /> : null}
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:gap-4 sm:justify-between shrink-0">
        {isCompleted &&
        (completedByDisplayName ||
          (task.completedTime
            ? `Completed ${formatDateTime(task.completedTime)}`
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
            {task.completedTime ? (
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Completed {formatDateTime(task.completedTime)}
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
