import utils from "./utils";
import type { InferInsertModel } from "drizzle-orm";
import { events } from "../../lib/db/schema";

const {
  generateDeterministicId,
  getEventType,
  getOrganization,
  getInstructorNames,
  getLectureTitle,
  parseRoomName,
  parseEventResources,
  toTimeStrings,
} = utils;

export type RawEvent = {
  itemId: number;
  itemId2: number;
  itemName: string;
  subject_itemName?: string;
  subject_item_date?: string;
  subject_itemId: number;
  start: number | string;
  end: number | string;
  itemDetails?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ProcessedEvent = InferInsertModel<typeof events>;

function removeKECNoAcademicEvents(eventsList: ProcessedEvent[]): ProcessedEvent[] {
  return eventsList.filter((event) => {
    if (event.eventType !== "KEC") {
      return true;
    }

    const raw = event.raw as {
      itemDetails?: {
        defn?: {
          panel?: Array<{
            item?: Array<{ itemName?: string }>;
          }>;
        };
      };
    } | null | undefined;

    const itemName =
      raw?.itemDetails?.defn?.panel?.[1]?.item?.[0]?.itemName ?? null;

    return (
      itemName === "<p>Academic Session</p>" ||
      itemName === "<p>Academic session</p>" ||
      itemName === "<p>Class Session</p>"
    );
  });
}

function combineKECEvents(eventsList: ProcessedEvent[]): ProcessedEvent[] {
  const kecEvents = eventsList.filter((event) => event.eventType === "KEC");
  const nonKecEvents = eventsList.filter((event) => event.eventType !== "KEC");

  const kecGroups = kecEvents.reduce<Record<string, ProcessedEvent[]>>((groups, event) => {
    const key = `${event.date ?? ""}_${event.roomName ?? ""}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
    return groups;
  }, {});

  const combinedKecEvents: ProcessedEvent[] = [];

  Object.values(kecGroups).forEach((eventGroup) => {
    if (eventGroup.length === 1) {
      combinedKecEvents.push(eventGroup[0]);
      return;
    }

    let earliestStart = eventGroup[0].startTime ?? "00:00:00";
    let latestEnd = eventGroup[0].endTime ?? "00:00:00";

    eventGroup.forEach((event) => {
      if (event.startTime && event.startTime < earliestStart) {
        earliestStart = event.startTime;
      }
      if (event.endTime && event.endTime > latestEnd) {
        latestEnd = event.endTime;
      }
    });

    const combinedEvent: ProcessedEvent = {
      ...eventGroup[0],
      startTime: earliestStart,
      endTime: latestEnd,
      instructorNames: null,
      resources: [],
    };

    combinedKecEvents.push(combinedEvent);
  });

  return [...combinedKecEvents, ...nonKecEvents];
}

function mergeAdjacentRoomEvents(eventsList: ProcessedEvent[]): ProcessedEvent[] {
  const eventGroups = eventsList.reduce<Record<string, ProcessedEvent[]>>((groups, event) => {
    const key = `${event.date ?? ""}_${event.eventName ?? ""}_${event.startTime ?? ""}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
    return groups;
  }, {});

  const mergedEvents: ProcessedEvent[] = [];

  Object.values(eventGroups).forEach((eventGroup) => {
    if (eventGroup.length === 1) {
      mergedEvents.push(eventGroup[0]);
      return;
    }

    const room1420 = eventGroup.find((e) => e.roomName === "GH 1420");
    const room1430 = eventGroup.find((e) => e.roomName === "GH 1430");

    const room2410A = eventGroup.find((e) => e.roomName === "GH 2410A");
    const room2410B = eventGroup.find((e) => e.roomName === "GH 2410B");

    const room2420A = eventGroup.find((e) => e.roomName === "GH 2420A");
    const room2420B = eventGroup.find((e) => e.roomName === "GH 2420B");

    const room2430A = eventGroup.find((e) => e.roomName === "GH 2430A");
    const room2430B = eventGroup.find((e) => e.roomName === "GH 2430B");

    const processedEvents = new Set<ProcessedEvent>();

    if (room1420 && room1430) {
      mergedEvents.push({
        ...room1420,
        roomName: "GH 1420&30",
      });
      processedEvents.add(room1420);
      processedEvents.add(room1430);
    }

    if (room2410A && room2410B) {
      mergedEvents.push({
        ...room2410A,
        roomName: "GH 2410A&B",
      });
      processedEvents.add(room2410A);
      processedEvents.add(room2410B);
    } else if (room2410A || room2410B) {
      const singleEvent = room2410A || room2410B;
      if (singleEvent) {
        mergedEvents.push(singleEvent);
        processedEvents.add(singleEvent);
      }
    }

    if (room2420A && room2420B) {
      mergedEvents.push({
        ...room2420A,
        roomName: "GH 2420A&B",
      });
      processedEvents.add(room2420A);
      processedEvents.add(room2420B);
    }

    if (room2430A && room2430B) {
      mergedEvents.push({
        ...room2430A,
        roomName: "GH 2430A&B",
      });
      processedEvents.add(room2430A);
      processedEvents.add(room2430B);
    }

    eventGroup.forEach((event) => {
      if (!processedEvents.has(event)) {
        mergedEvents.push(event);
      }
    });
  });

  return mergedEvents;
}

export function transformRawEventsToEvents(rawData: RawEvent[]): ProcessedEvent[] {
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

    return {
      itemId: event.itemId,
      itemId2: event.itemId2,
      id: generateDeterministicId(
        event.itemId,
        event.itemId2,
        event.subject_itemId
      ),
      date: eventDate,
      startTime: startTimeStr,
      endTime: endTimeStr,
      eventName: event.itemName ?? null,
      eventType: getEventType(event),
      organization: getOrganization(event),
      instructorNames: getInstructorNames(event),
      lectureTitle: getLectureTitle(event),
      roomName: parseRoomName(event.subject_itemName ?? "") ?? "",
      resources: parseEventResources(event),
      updatedAt: new Date().toISOString(),
      raw: event,
    };
  });

  const mergedEvents = mergeAdjacentRoomEvents(processedEvents);
  const filteredEvents = removeKECNoAcademicEvents(mergedEvents);
  return filteredEvents;
}

export {
  generateDeterministicId,
  getEventType,
  getOrganization,
  getInstructorNames,
  getLectureTitle,
  parseRoomName,
  parseEventResources,
  toTimeStrings,
  combineKECEvents,
  mergeAdjacentRoomEvents,
  removeKECNoAcademicEvents,
};
