import { Event as EventType } from "@/lib/db/types";

export type DerivedEventMetrics = ReturnType<typeof derivded>;
export type EventWithDisplay<T extends EventType = EventType> = T & {
  derived: DerivedEventMetrics;
};

export function addDisplayColumns<T extends EventType>(
  events: T[]
): EventWithDisplay<T>[] {
  return events.map(
    (event) =>
      ({
        ...event,
        derived: derivded(event, 7, 23, 2.5, 96),
      }) satisfies EventWithDisplay<T>
  );
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
