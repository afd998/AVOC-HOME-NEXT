import { eq } from "drizzle-orm";

import { events } from "@/drizzle/schema";
import { db } from "@/lib/db";
import type { Event as EventRecord } from "@/lib/db/types";
import type { finalEvent } from "@/lib/data/calendar/calendar";

import { addFirstSessionFlags } from "./utils/hydrate-first-session";
import { hydrateEventsWithFaculty } from "./utils/hyrdate-faculty";
import { addDisplayColumns } from "./utils/hydrate-display-columns";
import { hydrateEventsWithResources } from "./utils/hydrate-event-resources";

const isTruthyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return null;
};

export async function getEventOccurrences(
  eventId: number
): Promise<finalEvent[]> {
  const baseEvent = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  if (!baseEvent) {
    return [];
  }

  const matchingEvents = await loadMatchingEvents(baseEvent);

  if (matchingEvents.length === 0) {
    return [];
  }

  const eventsWithFirstSessionFlag = await addFirstSessionFlags(matchingEvents);
  const eventsWithFaculty = await hydrateEventsWithFaculty(
    eventsWithFirstSessionFlag
  );
  const eventsWithDisplay = addDisplayColumns(eventsWithFaculty);
  const eventsWithResources = await hydrateEventsWithResources(
    eventsWithDisplay
  );

  return eventsWithResources;
}

async function loadMatchingEvents(
  baseEvent: EventRecord
): Promise<EventRecord[]> {
  const itemId = toNumber(baseEvent.itemId);
  const fallbackKey = isTruthyString(baseEvent.eventName)
    ? baseEvent.eventName.trim()
    : null;

  if (!itemId && !fallbackKey) {
    return [baseEvent];
  }

  const matches = await db.query.events.findMany({
    where: itemId
      ? eq(events.itemId, itemId)
      : eq(events.eventName, fallbackKey!),
    orderBy: (eventTable, { asc: ascFn }) => [
      ascFn(eventTable.date),
      ascFn(eventTable.startTime),
    ],
  });

  if (matches.length === 0) {
    return [baseEvent];
  }

  return matches;
}

