import { events, resourcesDict } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import type { finalEvent } from "../calendar";
import { shiftBlocks } from "@/drizzle/schema";
import { ShiftBlock } from "@/lib/db/types";
import { addFirstSessionFlags } from "./utils/hydrate-first-session";
import {
  FacultyMember,
  hydrateEventsWithFaculty,
} from "./utils/hyrdate-faculty";
import { addDisplayColumns } from "./utils/hydrate-display-columns";
import { hydrateEventsWithResources } from "./utils/hydrate-event-resources";
import { Event as EventType } from "@/lib/db/types";

export type EventWithRelations = EventType & {
  facultyEvents?: { faculty: FacultyMember }[];
  resourceEvents?: {
    resourcesDict: typeof resourcesDict.$inferSelect;
    quantity: number | null;
    instructions: string | null;
  }[];
};

export async function getEventsByDate(
  date: string
): Promise<EventWithRelations[]> {
  try {
    const matchingEvents = await db.query.events.findMany({
      where: eq(events.date, date),
      with: {
        facultyEvents: {
          with: {
            faculty: true,
          },
        },
        resourceEvents: {
          with: {
            resourcesDict: true,
          },
        },
      },
    });

    return matchingEvents as EventWithRelations[];
  } catch (error) {
    console.error("[db] getEventsByDate", { date, error });
    throw error;
  }
}

export const getEventById = async (
  eventId: string
): Promise<finalEvent | null> => {
  const event: EventType | undefined = await db.query.events.findFirst({
    where: eq(events.id, parseInt(eventId)),
  });
  if (!event) {
    return null;
  }
  const eventsWithFirstSessionFlag = await addFirstSessionFlags([event]);
  const hydratedEvents = await hydrateEventsWithFaculty(
    eventsWithFirstSessionFlag
  );
  const enhancedEvents = addDisplayColumns(hydratedEvents);
  const eventsWithResources = await hydrateEventsWithResources(enhancedEvents);
  return eventsWithResources[0];
};
