import { getFilters } from "../../filters";
import {
  db,
  venues,
  inArray,
  type RoomFilter,
  type Room,
  type Event as EventType,
} from "shared";

export async function filterEvents<T extends EventType>(
  eventsToFilter: T[],
  filter: string,
  roomFilters?: RoomFilter[]
): Promise<{ events: T[]; allowedRoomNames: string[] }> {
  const loadedFilters = roomFilters ?? (await getFilters());
  const filterObject = loadedFilters.find((f: RoomFilter) => f.name === filter);
  const allowedRoomNames = uniqueRoomNames(
    Array.isArray(filterObject?.display)
      ? (filterObject.display as string[])
      : []
  );

  if (filter === "All Rooms" || filter === "My Events") {
    return { events: eventsToFilter, allowedRoomNames };
  }

  if (!filterObject) {
    return { events: eventsToFilter, allowedRoomNames: [] };
  }

  const allowedRooms = new Set(allowedRoomNames);
  const filtered = eventsToFilter.filter((event) =>
    allowedRooms.has(event.roomName)
  );
  return { events: filtered, allowedRoomNames };
}

export async function resolveRoomList(
  filter: string,
  allowedRoomNames: string[]
): Promise<{ roomsToEnsure: string[]; roomLookup: Map<string, Room> }> {
  const normalizedNames = uniqueRoomNames(allowedRoomNames);
  if (normalizedNames.length > 0) {
    const roomLookup = await getRoomsByName(normalizedNames);
    return { roomsToEnsure: normalizedNames, roomLookup };
  }

  if (filter === "All Rooms") {
    const allRoomsLookup = await getAllRoomsMap();
    return {
      roomsToEnsure: Array.from(allRoomsLookup.keys()),
      roomLookup: allRoomsLookup,
    };
  }

  return { roomsToEnsure: [], roomLookup: new Map() };
}

async function getAllRoomsMap(): Promise<Map<string, Room>> {
  const allRooms = await db.select().from(venues);
  const lookup = new Map<string, Room>();
  allRooms.forEach((room) => {
    if (!room.name) return;
    lookup.set(room.name, room);
  });
  return lookup;
}

async function getRoomsByName(roomNames: string[]): Promise<Map<string, Room>> {
  if (roomNames.length === 0) return new Map();

  const roomRows = await db
    .select()
    .from(venues)
    .where(inArray(venues.name, roomNames));
  const lookup = new Map<string, Room>();
  roomRows.forEach((room) => {
    if (!room.name) return;
    lookup.set(room.name, room);
  });
  return lookup;
}

export function uniqueRoomNames(roomNames: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  roomNames.forEach((name) => {
    if (typeof name !== "string") return;
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    result.push(trimmed);
  });

  return result;
}
