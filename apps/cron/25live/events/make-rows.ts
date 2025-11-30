import * as utils from "../events/index"; 
import { parseEventResources } from "./parse-resourses";  
import { mergeAdjacentRoomEvents } from "./merge-adjacent-room-events";
import type { ProcessedEvent } from "shared";
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

  const processedEvents = filteredData.map<ProcessedEvent>((event) => {
    const { startTimeStr, endTimeStr } = toTimeStrings(event.start, event.end);

    const eventDate = event.subject_item_date
      ? event.subject_item_date.split("T")[0]
      : new Date().toISOString().split("T")[0];
    const resources = parseEventResources(event);

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
      roomName: parseRoomName(event.subject_itemName ?? "") ?? "",
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
