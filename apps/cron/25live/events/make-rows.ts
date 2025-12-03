import { db, rooms, type ProcessedEvent } from "shared";
import * as utils from "../events/index";
import { parseEventResources } from "./parse-resourses";
import { mergeAdjacentRoomEvents } from "./merge-adjacent-room-events";
import type { RawEvent } from "../schemas";
import { computeTransforms } from "./compute-transform";

const {
  composeEventIdInput,
  generateDeterministicId,
  getEventType,
  getOrganization,
  getInstructorNames,
  getLectureTitle,
  parseRoomName,
  toTimeStrings,
} = utils;

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
      id: rooms.id,
      name: rooms.name,
      spelling: rooms.spelling,
    })
    .from(rooms);

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

function removeKECNoAcademicEvents(
  eventsList: ProcessedEvent[]
): ProcessedEvent[] {
  return eventsList.filter((event) => {
    if (event.eventType !== "KEC") {
      return true;
    }

    const raw = event.raw as
      | {
          itemDetails?: {
            defn?: {
              panel?: Array<{
                item?: Array<{ itemName?: string }>;
              }>;
            };
          };
        }
      | null
      | undefined;

    const itemName =
      raw?.itemDetails?.defn?.panel?.[1]?.item?.[0]?.itemName ?? null;

    return (
      itemName === "<p>Academic Session</p>" ||
      itemName === "<p>Academic session</p>" ||
      itemName === "<p>Class Session</p>" ||
      itemName === "<p>Class session</p>"
    );
  });
}

export async function getEvents(
  rawData: RawEvent[]
): Promise<ProcessedEvent[]> {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  const filteredData = rawData.filter((event) => {
    const isPrivateEvent =
      event.itemId === 0 &&
      (event.itemName === "(Private)" || event.itemName === "Closed");

    return (
      !isPrivateEvent &&
      event.itemId2 !== 0 &&
      !event.subject_itemName?.includes("&")
    );
  });

  const roomLookup =
    filteredData.length > 0
      ? await buildRoomLookup()
      : new Map<string, number>();

  const processedEvents = filteredData.map<ProcessedEvent>((event) => {
    const { startTimeStr, endTimeStr } = toTimeStrings(event.start, event.end);

    const eventDate = event.subject_item_date
      ? event.subject_item_date.split("T")[0]
      : new Date().toISOString().split("T")[0];
    const resources = parseEventResources(event);
    const roomName = parseRoomName(event.subject_itemName ?? "") ?? "";

    return {
      itemId: event.itemId,
      itemId2: event.itemId2,
      id: generateDeterministicId(
        composeEventIdInput(event.itemId, event.itemId2, event.subject_itemId)
      ),
      date: eventDate,
      startTime: startTimeStr,
      endTime: endTimeStr,
      eventName: event.itemName ?? "",
      eventType: getEventType(event),
      organization: getOrganization(event),
      instructorNames: getInstructorNames(event),
      lectureTitle: getLectureTitle(event),
      roomName,
      venue: resolveVenueId(roomName, roomLookup),
      resources,
      updatedAt: new Date().toISOString(),
      raw: event,
    };
  });

  const mergedEvents = mergeAdjacentRoomEvents(processedEvents);
  const filteredEvents = removeKECNoAcademicEvents(mergedEvents);

  const transformMap = computeTransforms(filteredEvents);

  const eventsWithTransform = filteredEvents.map((event) => ({
    ...event,
    transform: transformMap.get(event.id) ?? null,
  }));

  return eventsWithTransform;
}

export {
  generateDeterministicId,
  getEventType,
  getOrganization,
  getInstructorNames,
  getLectureTitle,
  parseRoomName,
  toTimeStrings,
  removeKECNoAcademicEvents,
};

export { mergeAdjacentRoomEvents } from "./merge-adjacent-room-events";
