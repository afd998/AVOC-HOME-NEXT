import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

import type { EnhancedAction, ActionListItem } from "./types";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDateToTimeLabel(date: Date) {
  return timeFormatter.format(date);
}

export function formatTime(time?: string) {
  if (!time) return "No start time";

  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return formatDateToTimeLabel(date);
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
  const type = typeof action.type === "string" ? action.type.trim() : "";
  const subType = typeof action.subType === "string" ? action.subType.trim() : "";
  const typeUpper = type.toUpperCase();
  const subTypeUpper = subType.toUpperCase();
  const isPrepareVenue = typeUpper === "CONFIG" && subTypeUpper === "SET";
  const isStrikeVenue = subTypeUpper === "STRIKE";
  const isStaffAssistance = typeUpper === "STAFF ASSISTANCE" || subTypeUpper === "STAFF ASSISTANCE";
  const isConfig = typeUpper.includes("CONFIG") || subTypeUpper.includes("CONFIG");

  if (isPrepareVenue) {
    return "Prepare Venue";
  }

  if (isStrikeVenue) {
    return "Strike Venue";
  }

  if (isStaffAssistance) {
    return "Staff Assistance";
  }

  if (isConfig) {
    return "Configure Space";
  }

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

  // First pass: count recording checks per time slot
  const recordingCheckCounts = new Map<string, number>();
  sortedActions.forEach((entry) => {
    const isRecordingCheck = entry.action.type?.toUpperCase().includes("RECORDING") || 
                            entry.action.type?.toUpperCase().includes("CAPTURE") ||
                            entry.action.subType?.toUpperCase().includes("RECORDING") ||
                            entry.action.subType?.toUpperCase().includes("CAPTURE");
    
    if (isRecordingCheck) {
      const groupKey =
        entry.startMinutes !== null
          ? `recording-${entry.startMinutes}`
          : `recording-${entry.action.startTime ?? entry.action.id}`;
      recordingCheckCounts.set(groupKey, (recordingCheckCounts.get(groupKey) || 0) + 1);
    }
  });

  // Second pass: build items with conditional grouping
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
      
      // Only group if there are 3 or more items at this time
      const count = recordingCheckCounts.get(groupKey) || 0;
      if (count >= 3) {
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
      // If less than 3, treat as regular action
    }

    acc.push({ type: "action", entry });
    return acc;
  }, []);

  return { items, totalActions: sortedActions.length };
}
