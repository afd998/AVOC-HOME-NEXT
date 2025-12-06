import { db, venues, type ProcessedEvent, type SeriesRow, generateDeterministicId } from "shared";
import { parseRoomName } from "../events/index";
import { mergeAdjacentRoomEvents } from "./merge-adjacent-room-events";
import type { RawEvent, EventDetailReservation } from "../schemas";
import { computeTransforms } from "./compute-transform";

/**
 * Compose the input string for deterministic event ID generation.
 * Uses seriesId + rsvId + space key.
 */
const composeEventIdInput = (
  seriesId: number,
  rsvId: number,
  spaceKey: string
): string => `${seriesId}:${rsvId}:${spaceKey}`;

/**
 * Parse ISO datetime string to time string (HH:MM:SS)
 */
const parseTimeFromDt = (dt: string | null | undefined): string | null => {
  if (!dt) return null;
  const timePart = dt.split("T")[1];
  if (!timePart) return null;
  // Handle "13:30" or "13:30:00" formats
  const parts = timePart.split(":");
  const hours = parts[0]?.padStart(2, "0") ?? "00";
  const minutes = parts[1]?.padStart(2, "0") ?? "00";
  const seconds = parts[2]?.padStart(2, "0") ?? "00";
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Parse ISO datetime string to date string (YYYY-MM-DD)
 */
const parseDateFromDt = (dt: string | null | undefined): string | null => {
  if (!dt) return null;
  return dt.split("T")[0] ?? null;
};

/**
 * Parse resources from a reservation's res array
 */
const parseReservationResources = (
  rsv: EventDetailReservation
): ProcessedEvent["resources"] => {
  if (!rsv.res || !Array.isArray(rsv.res)) {
    return [];
  }
  return rsv.res.map((resource) => ({
    itemName: resource.itemName,
    quantity: typeof resource.quantity === "number" ? resource.quantity : null,
    instruction:
      typeof resource.instruction === "string" ? resource.instruction : null,
  }));
};

const normalizeRoomName = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\s+/g, "").toUpperCase();
};

const buildRoomLookup = async (): Promise<Map<string, number>> => {
  const roomRows = await db
    .select({
      id: venues.id,
      name: venues.name,
      spelling: venues.spelling,
    })
    .from(venues);

  const lookup = new Map<string, number>();

  roomRows.forEach(({ id, name, spelling }) => {
    const normalizedName = normalizeRoomName(name);
    if (normalizedName && !lookup.has(normalizedName)) {
      lookup.set(normalizedName, id);
    }

    const normalizedSpelling = normalizeRoomName(spelling);
    if (normalizedSpelling && !lookup.has(normalizedSpelling)) {
      lookup.set(normalizedSpelling, id);
    }
  });

  return lookup;
};

const resolveVenueId = (
  roomName: string | null | undefined,
  roomLookup: Map<string, number>
): number | null => {
  const normalized = normalizeRoomName(roomName);
  if (!normalized) {
    return null;
  }

  return roomLookup.get(normalized) ?? null;
};

const getReservationCount = (series: RawEvent): number => {
  const reservations = series.itemDetails?.occur?.prof?.[0]?.rsv ?? [];
  return reservations.length;
};

const getRoomNameForSpace = (
  series: RawEvent,
  spaceName: string | null | undefined
): string | null => {
  const parsedSpace = parseRoomName(spaceName ?? "");
  if (parsedSpace) {
    return parsedSpace;
  }

  const subjectName = series.subject_itemName ?? "";
  return parseRoomName(subjectName ?? "");
};

export async function makeEventRows(
  rawData: RawEvent[],
  seriesRows: SeriesRow[]
): Promise<ProcessedEvent[]> {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  const allowedSeriesIds = new Set(
    (Array.isArray(seriesRows) ? seriesRows : [])
      .map((series) => series.id)
      .filter((id): id is number => typeof id === "number")
  );

  if (allowedSeriesIds.size === 0) {
    return [];
  }

  const allowedSeriesData = rawData.filter((series) =>
    allowedSeriesIds.has(series.itemId)
  );

  const seriesById = new Map<number, RawEvent>();
  for (const series of allowedSeriesData) {
    const existing = seriesById.get(series.itemId);
    if (!existing) {
      seriesById.set(series.itemId, series);
      continue;
    }

    const existingCount = getReservationCount(existing);
    const currentCount = getReservationCount(series);
    if (currentCount > existingCount) {
      console.warn("Duplicate series in raw data; choosing series with more reservations", {
        seriesId: series.itemId,
        existingReservations: existingCount,
        currentReservations: currentCount,
        itemName: series.itemName,
      });
      seriesById.set(series.itemId, series);
    }
  }

  const uniqueSeriesData = Array.from(seriesById.values());

  // Filter out private events and invalid series
  const filteredData = uniqueSeriesData.filter((series) => {
    const isPrivateEvent =
      series.itemId === 0 &&
      (series.itemName === "(Private)" || series.itemName === "Closed");

    return (
      !isPrivateEvent &&
      series.itemId2 !== 0 &&
      !series.subject_itemName?.includes("&")
    );
  });

  const roomLookup =
    filteredData.length > 0
      ? await buildRoomLookup()
      : new Map<string, number>();

  // Explode each series into multiple events from its reservations
  const processedEvents: ProcessedEvent[] = [];
  const seenEventIds = new Set<string>();
  const loggedDuplicateEventIds = new Set<string>();

  for (const series of filteredData) {
    const seriesId = series.itemId;
    const reservations = series.itemDetails?.occur?.prof?.[0]?.rsv ?? [];

    for (const rsv of reservations) {
      const rsvId = rsv.rsvId;
      const eventDate = parseDateFromDt(rsv.startDt);
      const startTime = parseTimeFromDt(rsv.startDt);
      const endTime = parseTimeFromDt(rsv.endDt);

      // Skip reservations without required time data
      if (!eventDate || !startTime || !endTime) {
        continue;
      }

      const resources = parseReservationResources(rsv);
      const spaces =
        Array.isArray(rsv.space) && rsv.space.length > 0
          ? rsv.space
          : [undefined];

      for (const space of spaces) {
        const spaceName = space?.itemName ?? null;
        const roomName = getRoomNameForSpace(series, spaceName);
        const spaceKey = normalizeRoomName(spaceName) ?? "NOSPACE";
        const eventId = generateDeterministicId(
          composeEventIdInput(seriesId, rsvId, spaceKey)
        );
        const eventKey = String(eventId);

        if (seenEventIds.has(eventKey) && !loggedDuplicateEventIds.has(eventKey)) {
          console.warn("Duplicate event detected in raw data", {
            seriesId,
            rsvId,
            eventId,
            date: eventDate,
            startTime,
            endTime,
            itemName: series.itemName,
            subjectItemName: series.subject_itemName,
            spaceName,
          });
          loggedDuplicateEventIds.add(eventKey);
        } else {
          seenEventIds.add(eventKey);
        }

        const venueId = resolveVenueId(roomName, roomLookup);

        processedEvents.push({
          id: eventId,
          series: seriesId,
          itemId2: series.itemId2,
          date: eventDate,
          startTime,
          endTime,
          venue: venueId,
          resources,
          updatedAt: new Date().toISOString(),
          // roomName needed for merging adjacent room events
          roomName: roomName ?? "",
        } as ProcessedEvent);
      }
    }
  }

  const mergedEvents = mergeAdjacentRoomEvents(processedEvents);

  const transformMap = computeTransforms(mergedEvents);

  const eventsWithTransform = mergedEvents.map((event) => ({
    ...event,
    transform: transformMap.get(event.id) ?? null,
  }));

  return eventsWithTransform;
}

export {
  generateDeterministicId,
  parseRoomName,
  composeEventIdInput,
};

export { mergeAdjacentRoomEvents } from "./merge-adjacent-room-events";
