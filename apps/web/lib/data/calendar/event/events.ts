import {
  eq,
  db,
  events,
  resourcesDict,
  type Event as EventType,
  type EventHybridRow,
  type EventAVConfigRow,
  type EventRecordingRow,
  type EventOtherHardwareRow,
} from "shared";
import type { finalEvent } from "../calendar";
import { addDisplayColumns } from "./utils/hydrate-display-columns";
import type { CalendarEventResource } from "./utils/hydrate-event-resources";
import type { FacultyMember } from "./utils/hyrdate-faculty";
import type { ActionWithDict } from "@/lib/data/actions/actions";

export type EventWithRelations = EventType & {
  facultyEvents?: { faculty: FacultyMember | null }[];
  resourceEvents?: {
    resourcesDict: typeof resourcesDict.$inferSelect | null;
    quantity: number | null;
    instructions: string | null;
  }[];
  eventHybrids?: EventHybridRow[];
  eventAvConfigs?: EventAVConfigRow[];
  eventRecordings?: EventRecordingRow[];
  eventOtherHardwares?: (EventOtherHardwareRow & {
    otherHardwareDict?: { id: string } | null;
  })[];
  actions?: any[]; // Will be properly typed from Drizzle query result
};

type HydratedEvent = EventType & {
  faculty: FacultyMember[];
  resources: CalendarEventResource[];
  isFirstSession: boolean;
  hybrid?: EventHybridRow;
  avConfig?: EventAVConfigRow;
  recording?: EventRecordingRow;
  otherHardware?: EventOtherHardwareRow[];
  actions?: ActionWithDict[];
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
  const { facultyEvents, resourceEvents, eventHybrids, eventAvConfigs, eventRecordings, eventOtherHardwares, actions, ...event } = eventWithRelations;

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

  // Extract first item from each relation array (one-to-one relationships)
  const hybrid = eventHybrids && eventHybrids.length > 0 ? eventHybrids[0] : undefined;
  const avConfig = eventAvConfigs && eventAvConfigs.length > 0 ? eventAvConfigs[0] : undefined;
  const recording = eventRecordings && eventRecordings.length > 0 ? eventRecordings[0] : undefined;
  
  // Process other hardware (one-to-many relationship)
  const otherHardware = (eventOtherHardwares ?? []).map((hw) => ({
    event: hw.event,
    createdAt: hw.createdAt,
    quantity: hw.quantity,
    instructions: hw.instructions,
    otherHardwareDict: typeof hw.otherHardwareDict === 'object' && hw.otherHardwareDict !== null 
      ? (hw.otherHardwareDict as { id: string }).id 
      : (hw.otherHardwareDict as string),
  })) as EventOtherHardwareRow[];

  // Map actions to ActionWithDict format
  const mappedActions: ActionWithDict[] = (actions ?? []).map((action: any) => {
    const { profile_assignedTo, profile_completedBy, qcItems, ...actionData } = action;
    return {
      ...actionData,
      eventDetails: null, // Event details not needed in this context
      assignedToProfile: profile_assignedTo ?? null,
      completedByProfile: profile_completedBy ?? null,
      qcItems: (qcItems ?? []).map((item: any) => ({
        ...item,
        qcItemDict: item.qcItemDict ?? null,
      })),
    } as ActionWithDict;
  });

  const hydratedEvent: HydratedEvent = {
    ...event,
    faculty: facultyMembers,
    resources,
    isFirstSession: false,
    hybrid,
    avConfig,
    recording,
    otherHardware,
    actions: mappedActions,
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
      eventHybrids: true,
      eventAvConfigs: true,
      eventRecordings: true,
      eventOtherHardwares: {
        with: {
          otherHardwareDict: true,
        },
      },
      actions: {
        with: {
          profile_assignedTo: true,
          profile_completedBy: true,
          qcItems: {
            with: {
              qcItemDict: true,
            },
          },
        },
      },
    },
  });

  if (!eventWithRelations) {
    return null;
  }

  return toFinalEvent(eventWithRelations as EventWithRelations);
};

export const getEventsBySeries = async (
  seriesId: string
): Promise<finalEvent[]> => {
  const itemId = Number.parseInt(seriesId, 10);
  if (Number.isNaN(itemId)) {
    return [];
  }

  const eventsWithRelations = await db.query.events.findMany({
    where: eq(events.itemId, itemId),
    orderBy: (eventTable, { asc }) => [
      asc(eventTable.date),
      asc(eventTable.startTime),
    ],
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
      eventHybrids: true,
      eventAvConfigs: true,
      eventRecordings: true,
      eventOtherHardwares: {
        with: {
          otherHardwareDict: true,
        },
      },
      actions: {
        with: {
          profile_assignedTo: true,
          profile_completedBy: true,
          qcItems: {
            with: {
              qcItemDict: true,
            },
          },
        },
      },
    },
  });

  return eventsWithRelations.map((event) =>
    toFinalEvent(event as EventWithRelations)
  );
};