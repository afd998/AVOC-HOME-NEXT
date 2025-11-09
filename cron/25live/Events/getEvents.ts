import * as utils from "./index.js";
import { parseEventResources } from "./parse-resourses.js";
import { mergeAdjacentRoomEvents } from "./mergeAdjacentRoomEvents.js";
import { computeFirstLecture } from "./computeFirstLecture.js";
import type { ProcessedEvent } from "../../../lib/db/types";
import type { RawEvent } from "../schemas";

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

  // Compute which lectures are the first lecture for their event name
  const firstLectureIds = await computeFirstLecture(filteredEvents);

  return filteredEvents.map((event) => ({
    ...event,
    firstLecture:
      event.eventType === "Lecture" && firstLectureIds.has(event.id),
  }));
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

export { mergeAdjacentRoomEvents } from "./mergeAdjacentRoomEvents.js";
