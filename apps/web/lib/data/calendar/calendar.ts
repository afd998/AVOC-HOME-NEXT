import { getFilters } from "../filters";
import { db, eq, venues, type Room } from "shared";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  addDisplayColumns,
  type EventWithDisplay,
} from "./event/utils/hydrate-display-columns";
import { getEventsByDate, type CalendarEventHydrated } from "./event/events";
import {
  groupEventsByRoom,
  handleMergedRooms,
  type RoomGroup,
  expandMergedRoomNames,
} from "./utils/room-groups";
import { filterEvents, resolveRoomList } from "./utils/room-filters";

type HydratedEvent = CalendarEventHydrated;
export type finalEvent = EventWithDisplay<HydratedEvent>;
export type RoomRowData = RoomGroup<finalEvent>;
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
  const eventsWithRelations = await (async () => {
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

  const roomFilters = await getFilters();
  const { events: filteredEvents, allowedRoomNames } = await filterEvents(
    eventsWithRelations,
    filter,
    roomFilters
  );
  console.log("[calendar.getCalendar] filterEvents complete", {
    inputCount: eventsWithRelations.length,
    outputCount: filteredEvents.length,
    filter,
    timestamp: new Date().toISOString(),
  });
  const enhancedEvents = addDisplayColumns(filteredEvents);
  const roomGroups = groupEventsByRoom(enhancedEvents);
  if (!autoHide) {
    const { roomsToEnsure, roomLookup } = await resolveRoomList(
      filter,
      allowedRoomNames
    );
    if (roomsToEnsure.length > 0) {
      const existingRooms = new Set(roomGroups.map((group) => group.roomName));
      const missingRooms = roomsToEnsure.filter(
        (roomName) => !existingRooms.has(roomName)
      );

      if (missingRooms.length > 0) {
        missingRooms.forEach((roomName) => {
          const roomRecord = roomLookup.get(roomName) ?? null;
          roomGroups.push({
            roomName,
            events: [],
            venueId: roomRecord?.id ?? null,
            room: roomRecord,
          });
        });
      }
    }
  }
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

export async function getVenueCalendarRow(
  date: string,
  venueId: string | number,
  filter = "All Rooms",
  autoHide = false
): Promise<RoomRowData | null> {
  const numericVenueId =
    typeof venueId === "string"
      ? Number.parseInt(venueId, 10)
      : venueId;

  if (!Number.isFinite(numericVenueId)) {
    return null;
  }

  const rows = await getCalendar(date, filter, autoHide);
  const directMatch =
    rows.find((row) => row.venueId === numericVenueId) ?? null;
  if (directMatch) {
    return directMatch;
  }

  // Fallback: merged rooms (e.g., "GH 2420A&B") get collapsed into base rooms
  // when building the calendar. If the merged room's ID isn't present in the
  // grouped data, try matching by the venue's name or its expanded components.
  try {
    const venueRecord = await db.query.venues.findFirst({
      where: eq(venues.id, numericVenueId),
    });

    if (!venueRecord) {
      return null;
    }

    const candidateNames = new Set<string>();
    [venueRecord.name, venueRecord.spelling].forEach((value) => {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      if (!trimmed) return;
      candidateNames.add(trimmed);
      expandMergedRoomNames(trimmed).forEach((expanded) => {
        const expandedTrimmed = expanded.trim();
        if (expandedTrimmed) {
          candidateNames.add(expandedTrimmed);
        }
      });
    });

    if (candidateNames.size === 0) {
      return null;
    }

    const aliasMatch =
      rows.find((row) => candidateNames.has(row.roomName)) ?? null;

    if (!aliasMatch) {
      return null;
    }

    return {
      ...aliasMatch,
      venueId: numericVenueId,
      roomName:
        venueRecord.name ??
        venueRecord.spelling ??
        aliasMatch.roomName,
      room: aliasMatch.room ?? venueRecord,
    };
  } catch (error) {
    console.error("[calendar.getVenueCalendarRow] fallback lookup failed", {
      venueId: numericVenueId,
      error,
    });
    return null;
  }
}
