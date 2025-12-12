import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { type ProcessedEvent } from "shared";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_ZONE = "America/Chicago";

export function getEventStartDate(event: ProcessedEvent): Dayjs | null {
  if (!event.date || !event.startTime) {
    return null;
  }
  const timestamp = dayjs.tz(`${event.date}T${event.startTime}`, TIME_ZONE);
  return timestamp.isValid() ? timestamp : null;
}

export function partitionEventsByStart(
  events: ProcessedEvent[],
  reference: Dayjs = dayjs().tz(TIME_ZONE)
) {
  return events.reduce<{
    futureEvents: ProcessedEvent[];
    startedEvents: ProcessedEvent[];
  }>(
    (acc, event) => {
      const start = getEventStartDate(event);
      if (start && (start.isBefore(reference) || start.isSame(reference))) {
        acc.startedEvents.push(event);
      } else {
        acc.futureEvents.push(event);
      }
      return acc;
    },
    { futureEvents: [], startedEvents: [] }
  );
}
