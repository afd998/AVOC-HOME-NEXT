import { Event as EventType } from "@/lib/db/types";

export type EventWithFirstSession = EventType & { isFirstSession: boolean };

export function addFirstSessionFlags(
  events: EventType[]
): EventWithFirstSession[] {
  // Filter for lecture events only
  const lectureEvents = events.filter((event) => event.eventType === "Lecture");

  const firstLectureIds = new Set<number>();
  const earliestLectureByName = new Map<string, EventType>();

  lectureEvents.forEach((event) => {
    const partitionKey = event.eventName ?? "__UNNAMED__";
    const currentEarliest = earliestLectureByName.get(partitionKey);
    if (!currentEarliest) {
      earliestLectureByName.set(partitionKey, event);
      return;
    }

    if (compareLectureOrder(event, currentEarliest) < 0) {
      earliestLectureByName.set(partitionKey, event);
    }
  });

  earliestLectureByName.forEach((lecture) => {
    firstLectureIds.add(lecture.id);
  });

  // Map events with first session flag
  const eventsWithFirstSessionFlag: EventWithFirstSession[] = events.map((event) => ({
    ...event,
    isFirstSession:
      event.eventType === "Lecture" && firstLectureIds.has(event.id),
  }));

  return eventsWithFirstSessionFlag;
}

function compareLectureOrder(a: EventType, b: EventType) {
  const toComparableDate = (value: EventType["date"]) => {
    if (!value) {
      return "";
    }
    return String(value);
  };

  const dateComparison = toComparableDate(a.date).localeCompare(
    toComparableDate(b.date)
  );
  if (dateComparison !== 0) {
    return dateComparison;
  }
  return Number(a.id) - Number(b.id);
}
