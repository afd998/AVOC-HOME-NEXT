import Link from "next/link";
import { Check } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { TaskIcon } from "@/core/task/taskIcon";

import { convertTimeToMinutes } from "./utils";
import type { EnhancedTask } from "./types";

type TaskRowProps = {
  entry: EnhancedTask;
};

export default function TaskRow({ entry }: TaskRowProps) {
  const { task, roomName } = entry;

  const title = task.taskType?.trim() || "Task";
  const normalizedStatus = task.status?.trim() || null;
  const isCompleted =
    normalizedStatus?.toLowerCase() === "completed";
  const startMinutesAbsolute = convertTimeToMinutes(task.startTime);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayLocalIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const isSameDay =
    typeof task.date === "string"
      ? task.date === todayLocalIso
      : false;
  const isOverdue =
    !isCompleted &&
    isSameDay &&
    startMinutesAbsolute !== null &&
    startMinutesAbsolute <= nowMinutes;
  const subtitleParts = [task.eventDetails?.eventName?.trim()].filter(Boolean);
  const subtitle = subtitleParts.join(" | ");

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn(
        "items-start gap-3 px-3 py-2 transition-colors",
        isCompleted
          ? " hover:bg-emerald-50  border-emerald-200 bg-emerald-50 dark:bg-emerald-900 dark:border-emerald-800"
          : isOverdue
            ? "border-rose-200 bg-rose-100/70 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50"
            : "bg-muted/40 dark:bg-muted/90",
        isOverdue && "task-overdue"
      )}
      asChild
    >
      <Link
        href={`/tasks/${task.id}`}
        className={cn(
          "flex w-full items-start gap-3 no-underline transition-colors",
          isCompleted
            ? "hover:!bg-emerald-100 dark:hover:!bg-emerald-900/60"
            : isOverdue
              ? "hover:!bg-rose-200 dark:hover:!bg-rose-900/70"
              : "hover:!bg-muted/70 dark:hover:!bg-muted/40"
        )}
      >
        <ItemMedia
          variant="default"
          className={cn(
            "mt-1",
            isCompleted
              ? "text-emerald-600"
              : isOverdue
                ? "text-rose-600"
                : "text-muted-foreground"
          )}
        >
          <TaskIcon
            task={task}
            className={cn(
              "size-full p-1",
              isCompleted
                ? "text-emerald-600"
                : isOverdue
                  ? "text-rose-600"
                  : "text-muted-foreground"
            )}
          />
        </ItemMedia>
        <ItemContent className="flex-1 gap-1">
          <ItemTitle className="text-sm font-medium leading-tight">
            {title}
          </ItemTitle>
          <ItemDescription className="text-xs text-muted-foreground">
            {subtitle || "No additional details"}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="ml-auto flex flex-col items-end gap-2 text-xs font-medium uppercase">
          {isCompleted ? (
            <Check
              aria-label="Completed"
              className="h-4 w-4 shrink-0 text-emerald-600"
            />
          ) : null}
          <span className="text-muted-foreground">
            {roomName}
          </span>
        </ItemActions>
      </Link>
    </Item>
  );
}
