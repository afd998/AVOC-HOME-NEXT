"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { TaskIcon } from "@/core/task/taskIcon";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

type TaskPanelProps = {
  taskGroups: { roomName: string; tasks: HydratedTask[] }[];
};

type EnhancedTask = {
  roomName: string;
  task: HydratedTask;
  startMinutes: number | null;
  startLabel: string;
};

type TaskListItem =
  | { type: "task"; entry: EnhancedTask }
  | {
      type: "recording-group";
      groupKey: string;
      startLabel: string;
      tasks: EnhancedTask[];
      roomNames: string[];
    };

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatTime(time?: string) {
  if (!time) return "No start time";

  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return timeFormatter.format(date);
}

export default function TaskPanel({ taskGroups }: TaskPanelProps) {
  const flattened: EnhancedTask[] = taskGroups.flatMap((group) =>
    group.tasks.map((task) => ({
      roomName: group.roomName,
      task,
      startMinutes: getStartMinutes(task),
      startLabel: formatTime(task.startTime),
    }))
  );

  const sortedTasks = flattened.sort((a, b) => {
    const aStart = a.startMinutes ?? Number.MAX_SAFE_INTEGER;
    const bStart = b.startMinutes ?? Number.MAX_SAFE_INTEGER;

    if (aStart === bStart) {
      const typeA = a.task.taskType ?? "";
      const typeB = b.task.taskType ?? "";
      return typeA.localeCompare(typeB);
    }

    return aStart - bStart;
  });

  const listItems = sortedTasks.reduce<TaskListItem[]>((items, entry) => {
    if (entry.task.taskType === "RECORDING CHECK") {
      const groupKey =
        entry.startMinutes !== null
          ? `recording-${entry.startMinutes}`
          : `recording-${entry.task.startTime ?? entry.task.id}`;
      const previous = items.at(-1);

      if (previous?.type === "recording-group" && previous.groupKey === groupKey) {
        previous.tasks.push(entry);
        if (!previous.roomNames.includes(entry.roomName)) {
          previous.roomNames.push(entry.roomName);
        }
      } else {
        items.push({
          type: "recording-group",
          groupKey,
          startLabel: entry.startLabel,
          tasks: [entry],
          roomNames: [entry.roomName],
        });
      }

      return items;
    }

    items.push({ type: "task", entry });
    return items;
  }, []);

  const totalTasks = sortedTasks.length;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-4 py-3">
        <h2 className="text-base font-semibold leading-none">Task View</h2>
        <p className="text-xs text-muted-foreground">
          Review upcoming tasks alongside the calendar.
        </p>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {totalTasks === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
            No tasks scheduled for this date.
          </p>
        ) : (
          <ItemGroup className="gap-3">
            {listItems.map((item, index) => {
              if (item.type === "task") {
                const { task, roomName } = item.entry;
                const title = task.taskType?.trim() || "Task";
                const subtitleParts = [
                  item.entry.startLabel,
                  task.eventDetails?.eventName?.trim(),
                  task.status?.trim(),
                ].filter(Boolean);
                const subtitle = subtitleParts.join(" | ");

                return (
                  <Item
                    key={task.id}
                    variant="outline"
                    size="sm"
                    className="items-start gap-3 bg-muted/40 px-3 py-2"
                    asChild
                  >
                    <Link
                      href={`/tasks/${task.id}`}
                      className="flex w-full items-start gap-3 no-underline transition-colors hover:bg-muted/80"
                    >
                      <ItemMedia
                        variant="default"
                        className="mt-1   text-muted-foreground"
                      >
                        <TaskIcon
                          task={task}
                          className="size-full p-1 text-muted-foreground"
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
                      <ItemActions className="ml-auto items-start text-xs font-medium uppercase text-muted-foreground">
                        {roomName}
                      </ItemActions>
                    </Link>
                  </Item>
                );
              }

              const { tasks, startLabel, roomNames, groupKey } = item;
              const uniqueRoomsLabel =
                roomNames.length <= 2
                  ? roomNames.join(", ")
                  : `${roomNames.length} rooms`;
              const title = tasks.length === 1 ? "Recording Check" : "Recording Checks";
              const checkCountLabel =
                tasks.length === 1 ? "1 check" : `${tasks.length} checks`;

              return (
                <Collapsible key={`${groupKey}-${index}`} className="w-full">
                  <Item
                    variant="outline"
                    size="sm"
                    className="flex flex-col gap-0 p-0 bg-muted/40"
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180">
                      <ItemMedia
                        variant="default"
                        className="mt-1   text-muted-foreground"
                      >
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
                        const subtitleParts = [
                          formatTime(task.startTime),
                          task.eventDetails?.eventName?.trim(),
                          task.status?.trim(),
                        ].filter(Boolean);
                          const subtitle = subtitleParts.join(" | ");

                          return (
                            <Item
                              key={task.id}
                              variant="outline"
                              size="sm"
                              className="items-start gap-3 bg-background px-3 py-2"
                              asChild
                            >
                              <Link
                                href={`/tasks/${task.id}`}
                                className="flex w-full items-start gap-3 no-underline transition-colors hover:bg-muted/80"
                              >
                                <ItemMedia
                                  variant="icon"
                                  className="mt-1 border bg-muted/40 text-muted-foreground"
                                >
                                  <TaskIcon
                                    task={task}
                                    className="size-full p-1 text-muted-foreground"
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
                                <ItemActions className="ml-auto items-start text-xs font-medium uppercase text-muted-foreground">
                                  {roomName}
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
            })}
          </ItemGroup>
        )}
      </div>
    </div>
  );
}

function convertTimeToMinutes(time?: string) {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function getStartMinutes(task: HydratedTask) {
  if (typeof task.derived?.startMinutes === "number") {
    return task.derived.startMinutes;
  }
  return convertTimeToMinutes(task.startTime);
}
