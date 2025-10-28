import { getFilters } from "../filters";
import { RoomFilter } from "@/lib/db/types";
import { Event as EventType } from "@/lib/db/types";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { FacultyMember } from "./event/utils/hyrdate-faculty";
import type { CalendarEventResource } from "./event/utils/hydrate-event-resources";
import {
  addDisplayColumns,
  type EventWithDisplay,
} from "./event/utils/hydrate-display-columns";
import { getEventsByDate } from "./event/events";

type HydratedEvent = EventType & {
  faculty: FacultyMember[];
  resources: CalendarEventResource[];
  isFirstSession: boolean;
};
export type finalEvent = EventWithDisplay<HydratedEvent>;
export type RoomRowData = { roomName: string; events: finalEvent[] };
export async function getCalendar(
  date: string,
  filter: string,
  autoHide: boolean
) {
  "use cache";
  console.log("[calendar.getCalendar] start", {
    date,
    filter,
    autoHide,
    timestamp: new Date().toISOString(),
  });
  cacheTag(`calendar:${date}:${filter}:${autoHide ? "hide" : "show"}`);
  const rawEvents = await (async () => {
    try {
      const result = await getEventsByDate(date);
      console.log("[calendar.getCalendar] getEventsByDate resolved", {
        date,
        count: Array.isArray(result) ? result.length : null,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      console.error("[db] calendar.getCalendar", {
        date,
        filter,
        autoHide,
        error,
      });
      throw error;
    }
  })();

  const eventsWithRelations: HydratedEvent[] = rawEvents.map(
    ({ facultyEvents, resourceEvents, ...event }) => ({
      ...event,
      faculty: (facultyEvents ?? []).map((relation) => relation.faculty),
      resources: (resourceEvents ?? []).map((relation) => ({
        id: relation.resourcesDict.id,
        quantity: relation.quantity ?? 0,
        instruction: relation.instructions ?? "",
        displayName: relation.resourcesDict.name ?? relation.resourcesDict.id,
        isAVResource: Boolean(relation.resourcesDict.isAv),
        is_av: Boolean(relation.resourcesDict.isAv),
        icon: relation.resourcesDict.icon ?? null,
      })),
      isFirstSession: false,
    })
  );

  const filteredEvents = await filterEvents(eventsWithRelations, filter);
  console.log("[calendar.getCalendar] filterEvents complete", {
    inputCount: eventsWithRelations.length,
    outputCount: filteredEvents.length,
    filter,
    timestamp: new Date().toISOString(),
  });
  const enhancedEvents = addDisplayColumns(filteredEvents);
  const roomGroups = groupEventsByRoom(enhancedEvents);
  const finalRoomGroups = handleMergedRooms(roomGroups);
  const visibleRoomGroups = autoHide
    ? finalRoomGroups.filter((group) => group.events.length > 0)
    : finalRoomGroups;
  console.log("[calendar.getCalendar] final groups ready", {
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

function groupEventsByRoom(events: finalEvent[]): RoomRowData[] {
  // Group events by roomName
  const groupedEvents = events.reduce((acc, event) => {
    const roomName = event.roomName;
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(event);
    return acc;
  }, {} as Record<string, finalEvent[]>);

  // Convert to array of objects
  return Object.entries(groupedEvents).map(([roomName, events]) => ({
    roomName,
    events,
  }));
}

function handleMergedRooms(roomGroups: RoomRowData[]): RoomRowData[] {
  // Ensure any "&" rooms also create groups for the additional rooms they reference.
  const existingRoomNames = new Set(roomGroups.map((group) => group.roomName));
  roomGroups.forEach((group) => {
    if (!group.roomName.includes("&")) return;

    const expandedNames = expandMergedRoomNames(group.roomName).slice(1);
    expandedNames.forEach((name) => {
      if (existingRoomNames.has(name)) return;
      const emptyGroup: RoomRowData = { roomName: name, events: [] };
      roomGroups.push(emptyGroup);
      existingRoomNames.add(name);
    });
  });

  // Normalize "&" room names by merging their events into the first segment (base room).
  for (let i = roomGroups.length - 1; i >= 0; i--) {
    const room = roomGroups[i];
    if (!room.roomName.includes("&")) continue;

    const baseRoomName = room.roomName.split("&")[0].trim();
    const targetIndex = roomGroups.findIndex(
      (candidate) => candidate.roomName === baseRoomName
    );

    if (targetIndex !== -1) {
      roomGroups[targetIndex].events = [
        ...roomGroups[targetIndex].events,
        ...room.events,
      ];
    } else {
      roomGroups.push({
        roomName: baseRoomName,
        events: [...room.events],
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

async function filterEvents<T extends EventType>(
  eventsToFilter: T[],
  filter: string
): Promise<T[]> {
  if (filter === "All Rooms") {
    return eventsToFilter;
  }

  if (filter === "My Events") {
    return eventsToFilter;
  }

  const roomFilters: RoomFilter[] = await getFilters();
  const filterObject = roomFilters.find((f: RoomFilter) => f.name === filter);
  if (!filterObject) {
    return eventsToFilter;
  }

  const allowedRooms = new Set(filterObject.display as string[]);
  return eventsToFilter.filter((event) => allowedRooms.has(event.roomName));
}
