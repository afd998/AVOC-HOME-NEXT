"use client";

import { useCallback, useEffect } from "react";
import { ItemGroup } from "@/components/ui/item";
import { convertTimeToMinutes } from "./utils";

import RecordingGroup from "./RecordingGroup";
import TaskRow from "./TaskRow";
import type { TaskListItem } from "./types";

type TaskListProps = {
  items: TaskListItem[];
  onIndicatorUpdate?: (element: HTMLDivElement | null) => void;
};

export default function TaskList({
  items,
  onIndicatorUpdate,
}: TaskListProps) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  const todayIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  type StartGroup = {
    label: string;
    key: string;
    items: TaskListItem[];
    startMinutes: number | null;
    hasTodayTask: boolean;
  };

  const groups = items.reduce<StartGroup[]>((acc, item, index) => {
    const rawLabel =
      item.type === "task"
        ? item.entry.startLabel
        : item.startLabel;
    const label = rawLabel?.trim() || "No start time";
    const startMinutes =
      item.type === "task"
        ? convertTimeToMinutes(item.entry.task.startTime)
        : convertTimeToMinutes(item.tasks[0]?.task.startTime);
    const hasTodayTask =
      item.type === "task"
        ? item.entry.task.date === todayIso
        : item.tasks.some(({ task }) => task.date === todayIso);
    const previous = acc.at(-1);

    if (previous && previous.label === label) {
      previous.items.push(item);
      previous.hasTodayTask ||= hasTodayTask;
      if (startMinutes !== null) {
        if (previous.startMinutes === null) {
          previous.startMinutes = startMinutes;
        } else {
          previous.startMinutes = Math.min(previous.startMinutes, startMinutes);
        }
      }
      return acc;
    }

    acc.push({
      label,
      key: `${label}-${index}`,
      items: [item],
      startMinutes,
      hasTodayTask,
    });

    return acc;
  }, []);

  const hasTodayGroups = groups.some((group) => group.hasTodayTask);

  const indicatorIndex = (() => {
    if (!hasTodayGroups) return null;

    const firstUpcomingTimed = groups.findIndex(
      (group) =>
        group.hasTodayTask &&
        group.startMinutes !== null &&
        group.startMinutes >= nowMinutes
    );
    if (firstUpcomingTimed !== -1) {
      return firstUpcomingTimed;
    }

    for (let index = groups.length - 1; index >= 0; index -= 1) {
      const group = groups[index];
      if (!group.hasTodayTask) continue;
      if (group.startMinutes === null) continue;
      if (group.startMinutes <= nowMinutes) {
        return index + 1;
      }
    }

    const firstTodayGroup = groups.findIndex((group) => group.hasTodayTask);
    return firstTodayGroup === -1 ? null : firstTodayGroup;
  })();

  const indicatorRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      onIndicatorUpdate?.(node);
    },
    [onIndicatorUpdate]
  );

  useEffect(() => {
    if (indicatorIndex === null) {
      onIndicatorUpdate?.(null);
    }
  }, [indicatorIndex, onIndicatorUpdate]);

  const renderIndicator = (ref?: (node: HTMLDivElement | null) => void) => (
    <div
      ref={ref}
      className="flex items-center gap-3 px-1 py-1"
      data-task-now-indicator
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-400">
        Now · {currentTimeLabel}
      </span>
      <div className="h-px flex-1 bg-rose-500/60 dark:bg-rose-400/60" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, index) => (
        <div key={group.key} className="flex flex-col gap-2">
          {indicatorIndex === index
            ? renderIndicator(indicatorRefCallback)
            : null}
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </span>
          <ItemGroup className="gap-3">
            {group.items.map((item, index) => {
              if (item.type === "task") {
                return <TaskRow key={item.entry.task.id} entry={item.entry} />;
              }

              return (
                <RecordingGroup
                  key={`${item.groupKey}-${index}`}
                  group={item}
                />
              );
            })}
          </ItemGroup>
        </div>
      ))}
      {indicatorIndex !== null && indicatorIndex === groups.length
        ? renderIndicator(indicatorRefCallback)
        : null}
    </div>
  );
}
