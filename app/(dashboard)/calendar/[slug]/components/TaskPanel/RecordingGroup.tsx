import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { TaskIcon } from "@/core/task/taskIcon";

import TaskRow from "./TaskRow";
import { convertTimeToMinutes } from "./utils";
import type { RecordingGroupItem } from "./types";
import { taskOverdueClassName } from "./taskOverdueStyles";

type RecordingGroupProps = {
  group: RecordingGroupItem;
};

export default function RecordingGroup({ group }: RecordingGroupProps) {
  const { tasks, groupKey } = group;

  const title = tasks.length === 1 ? "Recording Check" : "Recording Checks";
  const completedCount = tasks.reduce((count, { task }) => {
    const normalizedStatus = task.status?.trim().toLowerCase();
    return normalizedStatus === "completed" ? count + 1 : count;
  }, 0);
  const isAllCompleted = tasks.length > 0 && completedCount === tasks.length;
  const checkCountLabel =
    tasks.length === 0
      ? "No checks"
      : `${completedCount}/${tasks.length} completed`;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const hasOverdueTask = tasks.some(({ task }) => {
    const normalizedStatus = task.status?.trim().toLowerCase();
    if (normalizedStatus === "completed") return false;
    if (task.date !== todayIso) return false;
    const startMinutes = convertTimeToMinutes(task.startTime);
    if (startMinutes === null) return false;
    return startMinutes <= nowMinutes;
  });

  return (
    <Collapsible className="w-full">
      <Item
        variant="outline"
        size="sm"
        className={cn(
          "flex flex-col gap-0 p-0",
          hasOverdueTask && [
            "border-rose-200 bg-rose-100/70 dark:border-rose-900 dark:bg-rose-950/40",
            taskOverdueClassName,
          ],
          isAllCompleted &&
            "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/60",
          !hasOverdueTask && !isAllCompleted && "bg-muted/40"
        )}
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180",
            hasOverdueTask
              ? "hover:bg-rose-200 dark:hover:bg-rose-900/70"
              : isAllCompleted
                ? "hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                : "hover:bg-muted/70 dark:hover:bg-muted/40"
          )}
        >
          <ItemMedia
            variant="default"
            className={cn(
              "mt-1",
              isAllCompleted ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            <TaskIcon
              task={tasks[0].task}
              className={cn(
                "size-full p-1",
                isAllCompleted ? "text-emerald-600" : "text-muted-foreground"
              )}
            />
          </ItemMedia>
          <ItemContent className="flex flex-1 flex-col gap-1">
            <ItemTitle className="text-sm font-medium leading-tight">
              {title}
            </ItemTitle>
            <ItemDescription className="text-xs text-muted-foreground">
              {checkCountLabel}
            </ItemDescription>
          </ItemContent>
          <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t px-3 pb-3 pt-2">
          <ItemGroup className="gap-2">
            {tasks.map((entry) => (
              <TaskRow
                key={`${groupKey}-${entry.task.id}`}
                entry={entry}
              />
            ))}
          </ItemGroup>
        </CollapsibleContent>
      </Item>
    </Collapsible>
  );
}
