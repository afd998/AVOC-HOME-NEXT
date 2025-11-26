import { type Event as EventType } from "shared";

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 23;
const PIXELS_PER_MINUTE = 2.5;
const ROOM_LABEL_WIDTH = 96;
const EVENT_MARGIN = 1;

export type DerivedEventMetrics = {
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  left: string;
  width: string;
  eventDurationHours: number;
  isShortLecture: boolean;
  isStudentEvent: boolean;
  isFacStaffEvent: boolean;
  isLecture: boolean;
  isAdHocClassMeeting: boolean;
  isMergedRoomEvent: boolean;
  truncatedEventName?: string;
};

export type EventWithDisplay<T extends EventType = EventType> = T & {
  derived: DerivedEventMetrics;
};

const truncateEventName = (event: EventType) => {
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

  return event.eventName;
};

export function addDisplayColumns<T extends EventType>(
  events: T[]
): EventWithDisplay<T>[] {
  return events.map((event) => {
    const [startHour, startMin] = event.startTime.split(":").map(Number);
    const [endHour, endMin] = event.endTime.split(":").map(Number);
    const eventStartMinutes = startHour * 60 + startMin;
    const eventEndMinutes = endHour * 60 + endMin;
    const durationMinutes = eventEndMinutes - eventStartMinutes;
    const eventDurationHours = durationMinutes / 60;
    const startMinutesRelative = eventStartMinutes - TIMELINE_START_HOUR * 60;
    const endMinutesRelative = eventEndMinutes - TIMELINE_END_HOUR * 60;
    const calculatedWidth =
      durationMinutes * PIXELS_PER_MINUTE - EVENT_MARGIN * 2;
    const isLecture = event.eventType === "Lecture";
    const isAdHocClassMeeting = event.eventType === "Ad Hoc Class Meeting";
    const isMergedRoomEvent = Boolean(event.roomName?.includes("&"));
    const isStudentEvent = Boolean(event.eventType
      ?.toLowerCase()
      .includes("student"));
    const isFacStaffEvent = !isStudentEvent;

    const derived: DerivedEventMetrics = {
      startMinutes: startMinutesRelative,
      endMinutes: endMinutesRelative,
      durationMinutes,
      left: `${
        startMinutesRelative * PIXELS_PER_MINUTE +
        EVENT_MARGIN -
        ROOM_LABEL_WIDTH
      }px`,
      width: `${calculatedWidth}px`,
      eventDurationHours,
      isShortLecture: isLecture && eventDurationHours < 2,
      isStudentEvent,
      isFacStaffEvent,
      isLecture,
      isAdHocClassMeeting,
      isMergedRoomEvent,
      truncatedEventName: truncateEventName(event),
    };

    return {
      ...event,
      derived,
    } satisfies EventWithDisplay<T>;
  });
}
