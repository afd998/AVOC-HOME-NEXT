import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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

import type { EnhancedTask } from "./types";

type TaskRowProps = {
  entry: EnhancedTask;
};

export default function TaskRow({ entry }: TaskRowProps) {
  const { task, roomName, startLabel } = entry;

  const title = task.taskType?.trim() || "Task";
  const normalizedStatus = task.status?.trim() || null;
  const isCompleted =
    normalizedStatus?.toLowerCase() === "completed";
  const subtitleParts = [
    startLabel,
    task.eventDetails?.eventName?.trim(),
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" | ");

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn(
        "items-start gap-3 px-3 py-2 transition-colors",
        isCompleted ? " hover:bg-emerald-50  border-emerald-200 bg-emerald-50 dark:bg-emerald-900 dark:border-emerald-800" : "bg-muted/40 dark:bg-muted/90"
      )}
      asChild
    >
      <Link
        href={`/tasks/${task.id}`}
        className={cn(
          "flex w-full items-start gap-3 no-underline transition-colors",
          isCompleted ? "hover:bg-emerald-50" : "hover:bg-muted/80"
        )}
      >
        <ItemMedia
          variant="default"
          className={cn(
            "mt-1",
            isCompleted ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          <TaskIcon
            task={task}
            className={cn(
              "size-full p-1",
              isCompleted ? "text-emerald-600" : "text-muted-foreground"
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
          {normalizedStatus ? (
            <Badge
              variant={isCompleted ? "affirmative" : "secondary"}
              className="uppercase tracking-wide"
            >
              {normalizedStatus.toUpperCase()}
            </Badge>
          ) : null}
          <span
            className={cn(
              "text-muted-foreground",
              isCompleted && "text-emerald-700"
            )}
          >
            {roomName}
          </span>
        </ItemActions>
      </Link>
    </Item>
  );
}
