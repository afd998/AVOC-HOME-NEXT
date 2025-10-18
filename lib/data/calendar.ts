import { getEvents } from "./events";
import { getFilters } from "./filters";
import { faculty, facultyEvents, roomFilters } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { RoomFilter } from "@/lib/db/types";
import { Event as EventType } from "@/lib/db/types";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { InferSelectModel, eq, inArray } from "drizzle-orm";
import { events } from "@/drizzle/schema";
type FacultyMember = InferSelectModel<typeof faculty>;
type HydratedEvent = EventType & {
  faculty: FacultyMember[];
  isFirstSession: boolean;
};

export type EnhancedEvent = HydratedEvent & {
  derived: ReturnType<typeof derivded>;
};
export type RoomRowData = { roomName: string; events: EnhancedEvent[] };

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

export async function getCalendar(date: string, filter: string) {
  "use cache";
  cacheTag(`calendar:${date}:${filter}`);
  const rawEvents = await db.query.events.findMany({
    where: eq(events.date, date),
  });


  const filteredEvents = await filterEvents(rawEvents, filter);
  const lectureEvents = filteredEvents.filter(
    (event) => event.eventType === "Lecture"
  );
  const firstLectureIds = determineFirstLectureIds(lectureEvents);
  const eventsWithFirstSessionFlag = filteredEvents.map((event) => ({
    ...event,
    isFirstSession:
      event.eventType === "Lecture" && firstLectureIds.has(event.id),
  }));
  const facultyByEventId = new Map<number, FacultyMember[]>();
  const eventIds = eventsWithFirstSessionFlag.map((event) => event.id);

  // Get faculty for events
  if (eventIds.length > 0) {
    const facultyRows = await db
      .select({
        eventId: facultyEvents.event,
        facultyMember: faculty,
      })
      .from(facultyEvents)
      .innerJoin(faculty, eq(facultyEvents.faculty, faculty.id))
      .where(inArray(facultyEvents.event, eventIds));

    facultyRows.forEach(({ eventId, facultyMember }) => {
      const existing = facultyByEventId.get(eventId);
      if (existing) {
        existing.push(facultyMember);
        return;
      }
      facultyByEventId.set(eventId, [facultyMember]);
    });
  }
//get first session flag
 
 
  // Hydrate events with faculty
  const hydratedEvents: HydratedEvent[] = eventsWithFirstSessionFlag.map((event) => ({
    ...event,
    faculty: facultyByEventId.get(event.id) ?? [],
  }));

  // Derive event data
  const enhancedEvents: EnhancedEvent[] = hydratedEvents.map((event) => ({
    ...event,
    derived: derivded(event, 7, 23, 2.5, 96),
  }));

  // Group events by roomName
  const groupedEvents = enhancedEvents.reduce((acc, event) => {
    const roomName = event.roomName;
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(event);
    return acc;
  }, {} as Record<string, EnhancedEvent[]>);

  // Convert to array of objects
  const roomGroups = Object.entries(groupedEvents).map(
    ([roomName, events]) => ({
      roomName,
      events,
    })
  );

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

  // Sort by roomName with letters before numbers, omitting first 3 chars ("GH ")
  roomGroups.sort((a, b) => {
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

  return roomGroups;

  //todo resolve ownership
  //resolve resourses
  //resolve first session
  //maybe compute pixel location
  //
}

function determineFirstLectureIds(events: EventType[]) {
  const firstLectureIds = new Set<number>();
  const earliestLectureByName = new Map<string, EventType>();

  events.forEach((event) => {
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

  return firstLectureIds;
}

function compareLectureOrder(a: EventType, b: EventType) {
  const toComparableDate = (value: EventType["date"]) => {
    if (!value) {
      return "";
    }
    if (value instanceof Date) {    
      return value.toISOString();
    }
    return value;
  };

  const dateComparison = toComparableDate(a.date).localeCompare(
    toComparableDate(b.date)
  );
  if (dateComparison !== 0) {
    return dateComparison;
  }
  return Number(a.id) - Number(b.id);
}

async function filterEvents(eventsToFilter: EventType[], filter: string) {
  if (filter == "All Rooms") {
    return eventsToFilter;
  }
  if (filter !== "My Events") {
    const roomFilters: RoomFilter[] = await getFilters();
    const filterObject = roomFilters.find((f: RoomFilter) => f.name === filter);
    if (filterObject) {
      return eventsToFilter.filter((event: EventType) =>
        (filterObject.display as string[]).includes(event.roomName)
      );
    }
  }
  return eventsToFilter;
}

export const derivded = (
  event: EventType,
  TimelineStartHour: number,
  TimelineEndHour: number,
  pixelsPerMinute: number,
  roomLabelWidth: number,
  eventMargin: number = 1
) => {
  if (!event.startTime || !event.endTime) {
    return {
      startMinutes: 0,
      TimelineStartHour: 7,
      TimelineEndHour: 23,
      durationMinutes: 0,
      left: "0px",
      width: "0px",
      eventDurationHours: 0,
      isShortLecture: false,
    };
  }

  // Parse start and end times (now in HH:MM:SS format)
  const [startHour, startMin] = event.startTime.split(":").map(Number);
  const [endHour, endMin] = event.endTime.split(":").map(Number);
  const eventStartMinutes = startHour * 60 + startMin;
  const eventEndMinutes = endHour * 60 + endMin;
  const durationMinutes = eventEndMinutes - eventStartMinutes;
  const eventDurationHours = durationMinutes / 60;
  const startMinutesRelative = eventStartMinutes - TimelineStartHour * 60;
  const endMinutesRelative = eventEndMinutes - TimelineEndHour * 60;
  const calculatedWidth = durationMinutes * pixelsPerMinute - eventMargin * 2;
  const isLecture = event.eventType === "Lecture";
  const isAdHocClassMeeting = event.eventType === "Ad Hoc Class Meeting";
  const isMergedRoomEvent = Boolean(event.roomName?.includes("&"));
  const isStudentEvent = event.eventType?.toLowerCase().includes("student");
  const isFacStaffEvent = !isStudentEvent;

  const truncatedEventName = (event: EventType) => {
    // Only truncate for specific event types
    if (
      event.eventType === "Lecture" ||
      event.eventType === "Exam" ||
      event.eventType === "Lab"
    ) {
      const dashIndex = event.eventName?.indexOf("-");
      return dashIndex !== -1
        ? event.eventName?.substring(0, dashIndex)
        : event.eventName;
    }

    // Return full name for all other event types (including Default)
    return event.eventName;
  };

  return {
    startMinutes: startMinutesRelative,
    endMinutes: endMinutesRelative,
    durationMinutes,
    left: `${
      startMinutesRelative * pixelsPerMinute + eventMargin - roomLabelWidth
    }px`,
    width: `${calculatedWidth}px`,
    eventDurationHours,
    isShortLecture: event.eventType === "Lecture" && eventDurationHours < 2,
    isStudentEvent,
    isFacStaffEvent,
    isLecture,
    isAdHocClassMeeting,
    isMergedRoomEvent,
    truncatedEventName: truncatedEventName(event),
  };
};
