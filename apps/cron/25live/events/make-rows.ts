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
  
  // Remove timezone offset (e.g., "-06:00", "+05:00", "-0600", "+0500")
  // Match timezone patterns: + or - followed by 4 digits (with or without colon)
  const timeWithoutTz = timePart.replace(/[+-]\d{2}:?\d{2}$/, "");
  
  // Handle "13:30" or "13:30:00" formats
  const parts = timeWithoutTz.split(":");
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
 * Parse resources from a reservation's resource_reservation (can be object or array)
 */
const parseReservationResources = (
  rsv: EventDetailReservation
): ProcessedEvent["resources"] => {
  if (!rsv.resource_reservation) {
    return [];
  }
  
  // Handle both single object and array of objects
  const resourceReservations = Array.isArray(rsv.resource_reservation)
    ? rsv.resource_reservation
    : [rsv.resource_reservation];
  
  return resourceReservations
    .map((resourceReservation) => {
      const resource = resourceReservation.resource;
      if (!resource || !resource.resource_name) {
        return null;
      }
      return {
        itemName: resource.resource_name,
        quantity:
          typeof resourceReservation.quantity === "number"
            ? resourceReservation.quantity
            : null,
        instruction:
          typeof resourceReservation.resource_instructions === "string"
            ? resourceReservation.resource_instructions
            : null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
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

const isSeriesCandidateValid = (series: RawEvent): boolean => {
  const isPrivateEvent =
    series.itemId === 0 &&
    (series.itemName === "(Private)" || series.itemName === "Closed");

  return (
    !isPrivateEvent &&
    series.itemId2 !== 0 &&
    !series.subject_itemName?.includes("&")
  );
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

    const existingValid = isSeriesCandidateValid(existing);
    const currentValid = isSeriesCandidateValid(series);

    const existingCount = getReservationCount(existing);
    const currentCount = getReservationCount(series);

    const shouldReplace =
      (!existingValid && currentValid) ||
      (existingValid === currentValid && currentCount > existingCount);

    if (shouldReplace) {
      console.warn(
        "Duplicate series in raw data; choosing preferred candidate",
        {
          seriesId: series.itemId,
          existingReservations: existingCount,
          currentReservations: currentCount,
          existingValid,
          currentValid,
          itemName: series.itemName,
          subjectItemName: series.subject_itemName,
        }
      );
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
      const rsvId = rsv.reservation_id;
      const eventDate = parseDateFromDt(rsv.reservation_start_dt);
      const startTime = parseTimeFromDt(rsv.reservation_start_dt);
      const endTime = parseTimeFromDt(rsv.reservation_end_dt);

      // Skip reservations without required time data
      if (!eventDate || !startTime || !endTime || !rsvId) {
        continue;
      }

      const resources = parseReservationResources(rsv);
      // Convert space_reservation.space (object) to array format
      const spaceReservation = rsv.space_reservation;
      const spaces =
        spaceReservation && spaceReservation.space
          ? [spaceReservation.space]
          : [undefined];

      for (const space of spaces) {
        const spaceName = space?.space_name ?? null;
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
