"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { TaskIcon } from "@/core/task/taskIcon";
import { createClient } from "@/lib/supabase/client";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { useCalendarTasksStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarTasksStore";
import { markTaskCompletedAction } from "./actions";
import CaptureQC from "./CaptureQC";

type TaskDialogContentProps = {
  taskId: string;
  slug: string;
};

type FetchState = "idle" | "loading" | "error";

let sharedSupabaseClient: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!sharedSupabaseClient) {
    sharedSupabaseClient = createClient();
  }
  return sharedSupabaseClient;
};

export default function TaskDialogContent({
  taskId,
  slug,
}: TaskDialogContentProps) {
  const numericTaskId = Number(taskId);
  const selectTask = useCalendarTasksStore(
    useCallback((state) => {
      if (!Number.isInteger(numericTaskId)) {
        return null;
      }
      for (const group of state.taskGroups) {
        const match = group.tasks.find((task) => task.id === numericTaskId);
        if (match) {
          return match;
        }
      }
      return null;
    }, [numericTaskId])
  );
  const updateTask = useCalendarTasksStore((state) => state.updateTask);

  const [task, setTask] = useState<HydratedTask | null>(selectTask);
  const [fetchState, setFetchState] = useState<FetchState>(
    selectTask ? "idle" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const isCompleted =
    (task?.status ?? "").trim().toLowerCase() === "completed";
  const completedByProfile = task?.completedByProfile ?? null;

  const applyTask = useCallback(
    (nextTask: HydratedTask | null) => {
      if (!nextTask) {
        return;
      }
      updateTask(nextTask);
      setTask(nextTask);
    },
    [updateTask]
  );

  const fetchTask = useCallback(async () => {
    if (!Number.isInteger(numericTaskId)) {
      setFetchState("error");
      setErrorMessage("Invalid task id.");
      return;
    }

    setFetchState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/tasks/${numericTaskId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setFetchState("error");
        setErrorMessage("Unable to load task details.");
        return;
      }

      const payload: { task: HydratedTask | null } = await response.json();
      if (!payload.task) {
        setFetchState("error");
        setErrorMessage("Task not found.");
        setTask(null);
        return;
      }

      applyTask(payload.task);
      setFetchState("idle");
    } catch (error) {
      console.error("[TaskModal] Failed to load task", error);
      setFetchState("error");
      setErrorMessage("Unable to load task details.");
    }
  }, [applyTask, numericTaskId]);

  useEffect(() => {
    if (selectTask) {
      setTask(selectTask);
      setFetchState("idle");
      setErrorMessage(null);
    } else if (fetchState === "loading") {
      fetchTask();
    }
  }, [fetchTask, fetchState, selectTask]);

  useEffect(() => {
    if (!Number.isInteger(numericTaskId)) {
      return;
    }

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`task-modal:${numericTaskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `id=eq.${numericTaskId}`,
        },
        () => {
          fetchTask();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTask, numericTaskId]);

  const handleMarkCompleted = useCallback(() => {
    if (
      !Number.isInteger(numericTaskId) ||
      !task ||
      isCompleted ||
      isCompleting
    ) {
      return;
    }

    const previousTask = task;
    const optimisticTask: HydratedTask = {
      ...task,
      status: "COMPLETED",
      completedTime: new Date().toISOString(),
      completedByProfile: task.completedByProfile ?? null,
    };

    setIsCompleting(true);
    setErrorMessage(null);
    applyTask(optimisticTask);

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        setIsCompleting(false);
      });
    } else {
      setIsCompleting(false);
    }

    void markTaskCompletedAction({
      taskId: numericTaskId,
      date: slug,
    })
      .then((result) => {
        if (!result.success) {
          setErrorMessage(result.error);
          applyTask(previousTask);
          return;
        }

        if (result.task) {
          applyTask(result.task);
        }
        setFetchState("idle");
        setErrorMessage(null);
      })
      .catch((error) => {
        try {
          console.error("[TaskModal] Failed to mark task completed", error);
        } catch {
          // noop: console may fail in edge cases
        }
        setErrorMessage("Unable to mark task as completed.");
        applyTask(previousTask);
      })
      .finally(() => {
        setIsCompleting(false);
      });
  }, [
    applyTask,
    isCompleted,
    isCompleting,
    numericTaskId,
    slug,
    task,
  ]);

  const formattedDate = useMemo(
    () => formatTaskDate(task?.date ?? ""),
    [task?.date]
  );
  const formattedTime = useMemo(
    () => formatTaskTime(task?.startTime),
    [task?.startTime]
  );
  const formattedStatus = useMemo(
    () => formatNullable(task?.status, "No status set"),
    [task?.status]
  );
  const hasStatus = (task?.status ?? "").trim().length > 0;
  const statusVariant = useMemo(() => {
    switch ((task?.status ?? "").trim().toLowerCase()) {
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
  }, [task?.status]);
  const completedAtLabel = useMemo(() => {
    if (!isCompleted) {
      return null;
    }
    if (!task?.completedTime) {
      return "Completed";
    }
    return `Completed ${formatDateTime(task.completedTime)}`;
  }, [isCompleted, task?.completedTime]);
  const completedByDisplayName = useMemo(() => {
    if (!completedByProfile) {
      return null;
    }
    const name = completedByProfile.name?.trim();
    if (name && name.length > 0) {
      return name;
    }
    const id = completedByProfile.id?.trim();
    if (id && id.length > 0) {
      return `User ${id.slice(0, 8)}…`;
    }
    return "Unknown user";
  }, [completedByProfile]);

  const completedByInitials = useMemo(() => {
    if (!completedByProfile) {
      return null;
    }
    const name = completedByProfile.name?.trim();
    if (name && name.length > 0) {
      return getInitials(name);
    }
    const id = completedByProfile.id?.trim();
    if (id && id.length > 0) {
      return id.slice(0, 2).toUpperCase();
    }
    return "??";
  }, [completedByProfile]);

  const completedByColor = useMemo(() => {
    const userId = completedByProfile?.id?.trim();
    if (!userId) {
      return null;
    }
    return generateUserColor(userId);
  }, [completedByProfile?.id]);

  const completedByAvatarStyle = useMemo(() => {
    if (!completedByColor) {
      return {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        color: "#047857",
      };
    }
    return {
      backgroundColor: completedByColor,
      color: "#ffffff",
    };
  }, [completedByColor]);
  const eventTitle = useMemo(() => {
    const title = task?.eventDetails?.eventName?.trim();
    if (title && title.length > 0) {
      return title;
    }
    return "Linked Event";
  }, [task?.eventDetails?.eventName]);

  const eventTimingLabel = useMemo(() => {
    const details = task?.eventDetails;
    if (!details) {
      return null;
    }
    const dateLabel = formatTaskDate(details.date);
    const startLabel = formatTaskTime(details.startTime);
    const endLabel = formatTaskTime(details.endTime);
    return `${dateLabel} · ${startLabel} - ${endLabel}`;
  }, [task?.eventDetails]);

  const eventLink = task?.eventDetails ? `/events/${task.eventDetails.id}` : null;
  const shouldShowCaptureQC = useMemo(() => {
    const taskType = task?.taskType;
    if (!taskType) {
      return false;
    }
    return taskType.trim().toUpperCase() === "RECORDING CHECK";
  }, [task?.taskType]);

  if (fetchState === "loading" && !task) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Loading task details...</DialogTitle>
          <DialogDescription>
            Fetching the latest task information. Hang tight!
          </DialogDescription>
        </DialogHeader>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Task not found</DialogTitle>
          <DialogDescription>
            We could not find a task for ID {taskId}. It may have been removed.
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <DialogFooter className="justify-end">
          <Button variant="outline" asChild>
            <Link href="/tasks">View all tasks</Link>
          </Button>
        </DialogFooter>
      </>
    );
  }

  const resourceEvents = task.eventDetails?.resourceEvents ?? [];
  const instructionEntries = resourceEvents
    .map((resourceEvent) => resourceEvent.instructions?.trim())
    .filter((value): value is string => !!value && value.length > 0);
  const hasInstructions = instructionEntries.length > 0;

  const taskDetails: Array<{ label: string; value: ReactNode; href?: string }> = [
    { label: "Venue", value: task.room },
  ];

  if (task.eventDetails) {
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
    <>
      <DialogHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background">
              <TaskIcon task={task} className="h-12 w-12 p-3" />
            </span>
            <div className="flex flex-col gap-1 text-left">
              <DialogTitle className="text-xl font-semibold">
                {(task.taskDictDetails?.displayName || "Task").trim()}
              </DialogTitle>
              <DialogDescription>
                {formattedDate} | {formattedTime}
              </DialogDescription>
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
      </DialogHeader>

      <div className="space-y-6">
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
      </div>

      <DialogFooter className="flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:gap-4 sm:justify-between">
        {isCompleted && (completedByDisplayName || completedAtLabel) ? (
          <div className="flex items-center gap-3">
            {completedByDisplayName && completedByInitials ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-emerald-200 shadow-sm">
                  <AvatarFallback
                    className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase"
                    style={completedByAvatarStyle}
                  >
                    {completedByInitials}
                  </AvatarFallback>
                </Avatar>
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
            {completedAtLabel ? (
              <span className="text-xs text-muted-foreground sm:text-sm">
                {completedAtLabel}
              </span>
            ) : null}
          </div>
        ) : completedAtLabel ? (
          <span className="text-xs text-muted-foreground sm:text-sm">
            {completedAtLabel}
          </span>
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
      </DialogFooter>
    </>
  );
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric", 
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatTaskDate(value: string) {
  if (!value) {
    return "No date";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
}

function formatTaskTime(value: string | null | undefined) {
  if (!value) {
    return "No start time";
  }
  const [hour, minute] = value.split(":");
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);
  if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
    return value;
  }
  const date = new Date();
  date.setHours(parsedHour, parsedMinute, 0, 0);
  return timeFormatter.format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return "??";
  }
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function generateUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#eab308",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#10b981",
    "#8b5cf6",
    "#f43f5e",
    "#f59e0b",
    "#84cc16",
    "#0ea5e9",
  ];

  return colors[Math.abs(hash) % colors.length];
}

function formatNullable(value: string | null | undefined, fallback: string) {
  if (value == null) {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
