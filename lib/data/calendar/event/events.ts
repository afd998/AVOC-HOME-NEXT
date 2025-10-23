import { events } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { finalEvent } from "../calendar";
import { shiftBlocks } from "@/drizzle/schema";
import { ShiftBlock } from "@/lib/db/types";
import { addFirstSessionFlags } from "./utils/hydrate-first-session";
import { hydrateEventsWithFaculty } from "./utils/hyrdate-faculty";
import { addDisplayColumns } from "./utils/hydrate-display-columns";
import { hydrateEventsWithResources } from "./utils/hydrate-event-resources";
import { Event as EventType } from "@/lib/db/types";

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
