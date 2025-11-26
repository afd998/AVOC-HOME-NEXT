import dayjs, { type Dayjs } from "dayjs";
import { type ProcessedEvent } from "../../lib/db/types";

export function getEventStartDate(event: ProcessedEvent): Dayjs | null {
  if (!event.date || !event.startTime) {
    return null;
  }
  const timestamp = dayjs(`${event.date}T${event.startTime}`);
  return timestamp.isValid() ? timestamp : null;
}

export function partitionEventsByStart(
  events: ProcessedEvent[],
  reference: Dayjs = dayjs()
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

