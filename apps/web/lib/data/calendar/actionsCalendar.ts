import { getFilters } from "../filters";
import { type RoomFilter } from "shared";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getActionsByDate, type ActionWithDict } from "../actions/actions";
import { addDisplayColumns, type HydratedAction } from "./actionUtils";
import { deriveAllowedRoomNames } from "./utils/room-filters";

type ActionRow = ActionWithDict;

export async function getActionsCalendar(
  date: string,
  filter: string,
  autoHide: boolean
) {
  "use cache";
  console.log("[calendar.getActionsCalendar] start", {
    date,
    filter,
    autoHide,
    timestamp: new Date().toISOString(),
  });
  cacheTag(`calendar:${date}`);
  cacheTag(`calendar:${date}:${filter}:${autoHide ? "hide" : "show"}`);
  const rawActions = await (async () => {
    try {
      const result = await getActionsByDate(date);
      console.log("[calendar.getActionsCalendar] getActionsByDate resolved", {
        date,
        count: Array.isArray(result) ? result.length : null,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      console.error(
        "[calendar.getActionsCalendar] getActionsByDate error",
        error instanceof Error ? error.message : error,
        {
          date,
          filter,
          autoHide,
        }
      );
      throw error;
    }
  })();

  const filteredActions = await filterActions(rawActions, filter);
  console.log("[calendar.getActionsCalendar] filterActions complete", {
    inputCount: rawActions.length,
    outputCount: filteredActions.length,
    filter,
    timestamp: new Date().toISOString(),
  });
  const HydrateActions = addDisplayColumns(filteredActions);
  const roomGroups = groupActionsByRoom(HydrateActions);
  const finalRoomGroups = roomGroups;
  const visibleRoomGroups = autoHide
    ? finalRoomGroups.filter((group) => group.actions.length > 0)
    : finalRoomGroups;
  console.log("[calendar.getActionsCalendar] final groups ready", {
    totalGroups: finalRoomGroups.length,
    visibleGroups: visibleRoomGroups.length,
    autoHide,
    timestamp: new Date().toISOString(),
  });

  // Sort by roomName with letters before numbers, omitting first 3 chars ("GH ")
  visibleRoomGroups.sort((a, b) => {
    // Skip first 3 characters ("GH ") and get the actual room identifier
    const aRoomId = a.roomName.substring(3);
    const bRoomId = b.roomName.substring(3);

    const aFirstChar = aRoomId.charAt(0);
    const bFirstChar = bRoomId.charAt(0);
    const aIsLetter = /[A-Za-z]/.test(aFirstChar);
    const bIsLetter = /[A-Za-z]/.test(bFirstChar);

    // If a starts with letter and b doesn't, a comes first
    if (aIsLetter && !bIsLetter) return -1;
    // If b starts with letter and a doesn't, b comes first
    if (!aIsLetter && bIsLetter) return 1;

    // Both are same type, sort alphabetically by room identifier
    return aRoomId.localeCompare(bRoomId);
  });

  return visibleRoomGroups;
}

function groupActionsByRoom(
  actions: HydratedAction[]
): { roomName: string; actions: HydratedAction[] }[] {
  // Group actions by roomName
  const groupedActions = actions.reduce((acc, action) => {
    const roomName = action.room;
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(action);
    return acc;
  }, {} as Record<string, HydratedAction[]>);

  // Convert to array of objects
  return Object.entries(groupedActions).map(([roomName, actions]) => ({
    roomName,
    actions,
  }));
}

function handleMergedRooms(
  roomGroups: { roomName: string; actions: HydratedAction[] }[]
): { roomName: string; actions: HydratedAction[] }[] {
  // Ensure any "&" rooms also create groups for the additional rooms they reference.
  const existingRoomNames = new Set(roomGroups.map((group) => group.roomName));
  roomGroups.forEach((group) => {
    if (!group.roomName.includes("&")) return;

    const expandedNames = expandMergedRoomNames(group.roomName).slice(1);
    expandedNames.forEach((name) => {
      if (existingRoomNames.has(name)) return;
      const emptyGroup: { roomName: string; actions: HydratedAction[] } = {
        roomName: name,
        actions: [],
      };
      roomGroups.push(emptyGroup);
      existingRoomNames.add(name);
    });
  });

  // Normalize "&" room names by merging their actions into the first segment (base room).
  for (let i = roomGroups.length - 1; i >= 0; i--) {
    const room = roomGroups[i];
    if (!room.roomName.includes("&")) continue;

    const baseRoomName = room.roomName.split("&")[0].trim();
    const targetIndex = roomGroups.findIndex(
      (candidate) => candidate.roomName === baseRoomName
    );

    if (targetIndex !== -1) {
      roomGroups[targetIndex].actions = [
        ...roomGroups[targetIndex].actions,
        ...room.actions,
      ];
    } else {
      roomGroups.push({
        roomName: baseRoomName,
        actions: [...room.actions],
      });
    }

    roomGroups.splice(i, 1);
  }

  return roomGroups;
}

function expandMergedRoomNames(roomName: string): string[] {
  const trimmedName = roomName.trim();
  if (!trimmedName.includes("&")) {
    return [trimmedName];
  }

  const segments = trimmedName.split("&").map((segment) => segment.trim());
  const [firstSegment, ...restSegments] = segments;

  if (!firstSegment) {
    return [trimmedName];
  }

  const lastSpaceIndex = firstSegment.lastIndexOf(" ");
  const prefix =
    lastSpaceIndex >= 0 ? firstSegment.slice(0, lastSpaceIndex + 1) : "";
  const baseSuffix = firstSegment.slice(lastSpaceIndex + 1);

  const expandedSegments = [firstSegment];

  restSegments.forEach((segment) => {
    if (!segment) return;

    if (segment.includes(" ")) {
      expandedSegments.push(segment);
      return;
    }

    if (baseSuffix.length >= segment.length && baseSuffix.length > 0) {
      const mergedSuffix =
        baseSuffix.slice(0, baseSuffix.length - segment.length) + segment;
      expandedSegments.push(`${prefix}${mergedSuffix}`);
      return;
    }

    expandedSegments.push(`${prefix}${segment}`);
  });

  return expandedSegments;
}

async function filterActions(
  actionsToFilter: ActionRow[],
  filter: string
): Promise<ActionRow[]> {
  if (filter === "All Rooms") {
    return actionsToFilter;
  }

  if (filter === "My Events") {
    return actionsToFilter;
  }

  const roomFilters: RoomFilter[] = await getFilters();
  const filterObject = roomFilters.find((f: RoomFilter) => f.name === filter);
  if (!filterObject) {
    return actionsToFilter;
  }

  const allowedRooms = new Set(deriveAllowedRoomNames(filterObject));
  return actionsToFilter.filter((action) => {
    const venue =
      action.eventDetails &&
      typeof action.eventDetails.venue === "object" &&
      action.eventDetails.venue !== null
        ? action.eventDetails.venue
        : null;
    const roomName =
      action.eventDetails?.roomName ??
      venue?.name ??
      venue?.spelling ??
      "";
    return allowedRooms.has(roomName);
  });
}

// Re-export types and functions for backward compatibility
export type { HydratedAction, DerivedActionMetrics } from "./actionUtils";
export { addDisplayColumns } from "./actionUtils";
