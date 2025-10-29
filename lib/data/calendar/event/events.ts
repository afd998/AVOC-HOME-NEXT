import { events, resourcesDict } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import type { finalEvent } from "../calendar";
import { addDisplayColumns } from "./utils/hydrate-display-columns";
import type { CalendarEventResource } from "./utils/hydrate-event-resources";
import type { FacultyMember } from "./utils/hyrdate-faculty";
import type { Event as EventType } from "@/lib/db/types";

export type EventWithRelations = EventType & {
  facultyEvents?: { faculty: FacultyMember | null }[];
  resourceEvents?: {
    resourcesDict: typeof resourcesDict.$inferSelect | null;
    quantity: number | null;
    instructions: string | null;
  }[];
};

type HydratedEvent = EventType & {
  faculty: FacultyMember[];
  resources: CalendarEventResource[];
  isFirstSession: boolean;
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

function toFinalEvent(eventWithRelations: EventWithRelations): finalEvent {
  const { facultyEvents, resourceEvents, ...event } = eventWithRelations;

  const facultyMembers = (facultyEvents ?? [])
    .map((relation) => relation.faculty)
    .filter((member): member is FacultyMember => Boolean(member));

  const resources = (resourceEvents ?? [])
    .map((relation) => {
      const resource = relation.resourcesDict;
      if (!resource) {
        return null;
      }

      return {
        id: resource.id,
        quantity: relation.quantity ?? 0,
        instruction: relation.instructions ?? "",
        displayName: resource.name ?? resource.id,
        isAVResource: Boolean(resource.isAv),
        is_av: Boolean(resource.isAv),
        icon: resource.icon ?? null,
      } satisfies CalendarEventResource;
    })
    .filter(
      (resource): resource is CalendarEventResource => resource !== null
    );

  const hydratedEvent: HydratedEvent = {
    ...event,
    faculty: facultyMembers,
    resources,
    isFirstSession: false,
  };

  return addDisplayColumns([hydratedEvent])[0] as finalEvent;
}

export const getEventById = async (
  eventId: string
): Promise<finalEvent | null> => {
  const id = Number.parseInt(eventId, 10);
  if (Number.isNaN(id)) {
    return null;
  }

  const eventWithRelations = await db.query.events.findFirst({
    where: eq(events.id, id),
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

  if (!eventWithRelations) {
    return null;
  }

  return toFinalEvent(eventWithRelations as EventWithRelations);
};
