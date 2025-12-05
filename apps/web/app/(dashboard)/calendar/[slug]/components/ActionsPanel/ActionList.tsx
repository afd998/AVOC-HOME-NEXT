"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ItemGroup } from "@/components/ui/item";
import { convertTimeToMinutes, formatDateToTimeLabel } from "./utils";

import RecordingGroup from "./RecordingGroup";
import ActionRow from "./ActionRow";
import type { ActionListItem } from "./types";

type ActionListProps = {
  items: ActionListItem[];
  onIndicatorUpdate?: (element: HTMLDivElement | null) => void;
  hideAssignedAvatar?: boolean;
};

export default function ActionList({
  items,
  onIndicatorUpdate,
  hideAssignedAvatar = false,
}: ActionListProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();
    const intervalId = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const nowMinutes =
    now !== null ? now.getHours() * 60 + now.getMinutes() : null;
  const currentTimeLabel = now ? formatDateToTimeLabel(now) : null;
  const todayIso =
    now === null
      ? null
      : [
          now.getFullYear(),
          String(now.getMonth() + 1).padStart(2, "0"),
          String(now.getDate()).padStart(2, "0"),
        ].join("-");

  type StartGroup = {
    label: string;
    key: string;
    items: ActionListItem[];
    startMinutes: number | null;
    hasTodayAction: boolean;
  };

  const groups = useMemo(
    () =>
      items.reduce<StartGroup[]>((acc, item, index) => {
        const rawLabel =
          item.type === "action" ? item.entry.startLabel : item.startLabel;
        const label = rawLabel?.trim() || "No start time";
        const startMinutes =
          item.type === "action"
            ? convertTimeToMinutes(item.entry.action.startTime)
            : convertTimeToMinutes(item.actions[0]?.action.startTime);
        const actionDate =
          item.type === "action"
            ? item.entry.action.eventDetails?.date
            : item.actions[0]?.action.eventDetails?.date;
        const hasTodayAction = todayIso !== null && actionDate === todayIso;
        const previous = acc.at(-1);

        if (previous && previous.label === label) {
          previous.items.push(item);
          previous.hasTodayAction ||= hasTodayAction;
          if (startMinutes !== null) {
            if (previous.startMinutes === null) {
              previous.startMinutes = startMinutes;
            } else {
              previous.startMinutes = Math.min(
                previous.startMinutes,
                startMinutes
              );
            }
          }
          return acc;
        }

        acc.push({
          label,
          key: `${label}-${index}`,
          items: [item],
          startMinutes,
          hasTodayAction,
        });

        return acc;
      }, []),
    [items, todayIso]
  );

  const hasTodayGroups = groups.some((group) => group.hasTodayAction);

  const indicatorIndex = (() => {
    if (!hasTodayGroups || nowMinutes === null) return null;

    const firstUpcomingTimed = groups.findIndex(
      (group) =>
        group.hasTodayAction &&
        group.startMinutes !== null &&
        group.startMinutes >= nowMinutes
    );
    if (firstUpcomingTimed !== -1) {
      return firstUpcomingTimed;
    }

    for (let index = groups.length - 1; index >= 0; index -= 1) {
      const group = groups[index];
      if (!group.hasTodayAction) continue;
      if (group.startMinutes === null) continue;
      if (group.startMinutes <= nowMinutes) {
        return index + 1;
      }
    }

    const firstTodayGroup = groups.findIndex((group) => group.hasTodayAction);
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

  const renderIndicator = (ref?: (node: HTMLDivElement | null) => void) => {
    if (!currentTimeLabel) return null;

    return (
      <div
        ref={ref}
        className="flex items-center gap-3 px-1 py-1"
        data-action-now-indicator
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-400">
          Now {"\u00B7"} {currentTimeLabel}
        </span>
        <div className="h-px flex-1 bg-rose-500/60 dark:bg-rose-400/60" />
      </div>
    );
  };

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
              if (item.type === "action") {
                return (
                  <ActionRow
                    key={item.entry.action.id}
                    entry={item.entry}
                    hideAssignedAvatar={hideAssignedAvatar}
                  />
                );
              }

              return (
                <RecordingGroup
                  key={`${item.groupKey}-${index}`}
                  group={item}
                  hideAssignedAvatar={hideAssignedAvatar}
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

