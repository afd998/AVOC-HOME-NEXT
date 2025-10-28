import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { TaskIcon } from "@/core/task/taskIcon";

import { formatTime } from "./utils";
import type { RecordingGroupItem } from "./types";

type RecordingGroupProps = {
  group: RecordingGroupItem;
};

export default function RecordingGroup({ group }: RecordingGroupProps) {
  const { tasks, startLabel, roomNames, groupKey } = group;

  const uniqueRoomsLabel =
    roomNames.length <= 2 ? roomNames.join(", ") : `${roomNames.length} rooms`;
  const title = tasks.length === 1 ? "Recording Check" : "Recording Checks";
  const checkCountLabel = tasks.length === 1 ? "1 check" : `${tasks.length} checks`;

  return (
    <Collapsible className="w-full">
      <Item
        variant="outline"
        size="sm"
        className="flex flex-col gap-0 bg-muted/40 p-0"
      >
        <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180">
          <ItemMedia variant="default" className="mt-1 text-muted-foreground">
            <TaskIcon
              task={tasks[0].task}
              className="size-full p-1 text-muted-foreground"
            />
          </ItemMedia>
          <ItemContent className="flex flex-1 flex-col gap-1">
            <ItemTitle className="text-sm font-medium leading-tight">
              {title}
            </ItemTitle>
            <ItemDescription className="text-xs text-muted-foreground">
              {startLabel} | {checkCountLabel}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="items-center text-xs font-medium uppercase text-muted-foreground">
            {uniqueRoomsLabel}
          </ItemActions>
          <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t px-3 pb-3 pt-2">
          <ItemGroup className="gap-2">
            {tasks.map(({ task, roomName }) => {
              const taskTitle = task.taskType?.trim() || "Task";
              const normalizedStatus = task.status?.trim() || null;
              const isCompleted =
                normalizedStatus?.toLowerCase() === "completed";
              const subtitleParts = [
                formatTime(task.startTime),
                task.eventDetails?.eventName?.trim(),
              ].filter(Boolean);
              const subtitle = subtitleParts.join(" | ");

              return (
                <Item
                  key={`${groupKey}-${task.id}`}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "items-start gap-3 px-3 py-2 transition-colors",
                    isCompleted
                      ? "border-emerald-200 bg-emerald-50"
                      : "bg-background"
                  )}
                  asChild
                >
                  <Link
                    href={`/tasks/${task.id}`}
                    className={cn(
                      "flex w-full items-start gap-3 no-underline transition-colors",
                      isCompleted ? "hover:bg-emerald-100" : "hover:bg-muted/80"
                    )}
                  >
                    <ItemMedia
                      variant="icon"
                      className={cn(
                        "mt-1 border",
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "bg-muted/40 text-muted-foreground"
                      )}
                    >
                      <TaskIcon
                        task={task}
                        className={cn(
                          "size-full p-1",
                          isCompleted
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                        )}
                      />
                    </ItemMedia>
                    <ItemContent className="flex-1 gap-1">
                      <ItemTitle className="text-sm font-medium leading-tight">
                        {taskTitle}
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
            })}
          </ItemGroup>
        </CollapsibleContent>
      </Item>
    </Collapsible>
  );
}
