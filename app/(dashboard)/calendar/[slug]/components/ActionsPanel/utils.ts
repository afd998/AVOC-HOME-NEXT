import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

import type { EnhancedAction, ActionListItem } from "./types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(time?: string) {
  if (!time) return "No start time";

  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return timeFormatter.format(date);
}

export function convertTimeToMinutes(time?: string) {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

export function getActionDisplayName(action: HydratedAction) {
  // Actions use type and subType instead of taskDictDetails
  const type = typeof action.type === "string" ? action.type.trim() : "";
  const subType = typeof action.subType === "string" ? action.subType.trim() : "";
  
  if (subType.length > 0) {
    return subType;
  }
  
  if (type.length > 0) {
    return type;
  }

  return "Action";
}

function getStartMinutes(action: HydratedAction) {
  if (typeof action.derived?.startMinutes === "number") {
    return action.derived.startMinutes;
  }
  return convertTimeToMinutes(action.startTime);
}

export function buildActionListItems(
  actionGroups: { roomName: string; actions: HydratedAction[] }[]
) {
  const flattened: EnhancedAction[] = actionGroups.flatMap((group) =>
    group.actions.map((action) => ({
      roomName: group.roomName,
      action,
      startMinutes: getStartMinutes(action),
      startLabel: formatTime(action.startTime),
    }))
  );

  const sortedActions = flattened.sort((a, b) => {
    const aStart = a.startMinutes ?? Number.MAX_SAFE_INTEGER;
    const bStart = b.startMinutes ?? Number.MAX_SAFE_INTEGER;

    if (aStart === bStart) {
      const nameA = getActionDisplayName(a.action);
      const nameB = getActionDisplayName(b.action);
      return nameA.localeCompare(nameB);
    }

    return aStart - bStart;
  });

  const items = sortedActions.reduce<ActionListItem[]>((acc, entry) => {
    // Check if this is a recording check action (type might be "CAPTURE_QC" or similar)
    const isRecordingCheck = entry.action.type?.toUpperCase().includes("RECORDING") || 
                            entry.action.type?.toUpperCase().includes("CAPTURE") ||
                            entry.action.subType?.toUpperCase().includes("RECORDING") ||
                            entry.action.subType?.toUpperCase().includes("CAPTURE");
    
    if (isRecordingCheck) {
      const groupKey =
        entry.startMinutes !== null
          ? `recording-${entry.startMinutes}`
          : `recording-${entry.action.startTime ?? entry.action.id}`;
      const previous = acc.at(-1);

      if (previous?.type === "recording-group" && previous.groupKey === groupKey) {
        previous.actions.push(entry);
        if (!previous.roomNames.includes(entry.roomName)) {
          previous.roomNames.push(entry.roomName);
        }
      } else {
        acc.push({
          type: "recording-group",
          groupKey,
          startLabel: entry.startLabel,
          actions: [entry],
          roomNames: [entry.roomName],
        });
      }

      return acc;
    }

    acc.push({ type: "action", entry });
    return acc;
  }, []);

  return { items, totalActions: sortedActions.length };
}

