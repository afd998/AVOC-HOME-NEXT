import {
  eq,
  inArray,
  type InferSelectModel,
  db,
  actions as actionsTable,
  events as eventsTable,
  profiles as profilesTable,
  resourceEvents as resourceEventsTable,
  resourcesDict as resourcesDictTable,
  qcItems as qcItemsTable,
  qcItemDict as qcItemDictTable,
  eventAvConfig as eventAvConfigTable,
  type EventAVConfigRow,
  type EventHybridRow,
  type EventRecordingRow,
  type EventOtherHardwareRow,
  type Series,
  type Room,
} from "shared";
import type { CalendarEventResource } from "@/lib/data/calendar/event/utils/hydrate-event-resources";

export type ActionRow = InferSelectModel<typeof actionsTable>;
export type EventRow = InferSelectModel<typeof eventsTable>;
export type ResourceEventRow = InferSelectModel<typeof resourceEventsTable>;
export type ResourceDictRow = InferSelectModel<typeof resourcesDictTable>;
export type ProfileRow = InferSelectModel<typeof profilesTable>;
export type QcItemRow = InferSelectModel<typeof qcItemsTable>;
export type QcItemDictRow = InferSelectModel<typeof qcItemDictTable>;

export type EventWithResourceDetails = Omit<EventRow, "venue"> & {
  venue: Room | number | null;
  roomName?: string | null;
  resourceEvents: (ResourceEventRow & {
    resourcesDict: ResourceDictRow | null;
  })[];
  eventAvConfigs?: EventAVConfigRow[];
  eventHybrids?: EventHybridRow[];
  eventRecordings?: EventRecordingRow[];
  eventOtherHardwares?: (EventOtherHardwareRow & {
    otherHardwareDict?: { id: string } | null;
  })[];
  series?: Series | null;
};

export type ActionWithDict = Omit<ActionRow, "event"> & {
  eventDetails: EventWithResourceDetails | null;
  assignedToProfile: ProfileRow | null;
  assignedToManualProfile: ProfileRow | null;
  completedByProfile: ProfileRow | null;
  qcItems: (QcItemRow & {
    qcItemDict: QcItemDictRow | null;
  })[];
};

export function hydrateEventDetails(
  event: EventWithResourceDetails | null
): EventWithResourceDetails | null {
  if (!event) return null;

  const venue =
    typeof event.venue === "object" && event.venue !== null ? event.venue : null;

  return {
    ...event,
    roomName: event.roomName ?? venue?.name ?? venue?.spelling ?? null,
  };
}

export async function getActionsByDate(date: string): Promise<ActionWithDict[]> {
  try {
    // First get all events for this date
    const eventsForDate = await db.query.events.findMany({
      where: eq(eventsTable.date, date),
      columns: { id: true },
    });

    const eventIds = eventsForDate.map((e) => e.id).filter((id): id is number => id !== null && id !== undefined);

    if (eventIds.length === 0) {
      return [];
    }

    // Step 1: Use direct query to filter actions at database level (much more efficient)
    const actionRows = await db
      .select({ id: actionsTable.id })
      .from(actionsTable)
      .where(inArray(actionsTable.event, eventIds));

    const actionIds = actionRows.map((r) => r.id).filter((id): id is number => id !== null && id !== undefined);

    if (actionIds.length === 0) {
      return [];
    }

    // Step 2: Use relational query API to fetch only those actions with all their relations
    const validActions = await db.query.actions.findMany({
      where: (actions, { inArray }) => inArray(actions.id, actionIds),
      with: {
        event: {
          with: {
            resourceEvents: {
              with: {
                resourcesDict: true,
              },
            },
            eventAvConfigs: true,
            eventHybrids: true,
            eventRecordings: true,
            eventOtherHardwares: {
              with: {
                otherHardwareDict: true,
              },
            },
            series: {
              with: {
                seriesFaculties: {
                  with: {
                    faculty: true,
                  },
                },
              },
            },
            venue: true,
          },
        },
        profile_assignedTo: true,
        profile_assignedToManual: true,
        profile_completedBy: true,
        qcItems: {
          with: {
            qcItemDict: true,
          },
        },
      },
    });

    return validActions.map(
      ({
        event,
        profile_assignedTo,
        profile_assignedToManual,
        profile_completedBy,
        qcItems,
        ...actionData
      }) => {
        const eventWithResources = hydrateEventDetails(
          event as EventWithResourceDetails | null
        );

        return {
          ...actionData,
          eventDetails: eventWithResources ?? null,
          assignedToProfile: profile_assignedTo ?? null,
          assignedToManualProfile: profile_assignedToManual ?? null,
          completedByProfile: profile_completedBy ?? null,
          qcItems: (qcItems ?? []).map((item) => ({
            ...item,
            qcItemDict: item.qcItemDict ?? null,
          })),
        } as ActionWithDict;
      }
    );
  } catch (error: any) {
    // Log comprehensive error details
    console.error("[getActionsByDate] Query error details:", {
      message: error?.message,
      name: error?.name,
      cause: error?.cause,
      stack: error?.stack,
      query: error?.query,
      params: error?.params,
      fullError: error,
    });
    
    // Extract underlying PostgreSQL error if available
    const pgError = error?.cause || error?.originalError || error;
    if (pgError && typeof pgError === 'object') {
      console.error("[getActionsByDate] PostgreSQL error:", {
        code: pgError.code,
        message: pgError.message,
        detail: pgError.detail,
        hint: pgError.hint,
      });
    }
    
    throw error;
  }
}
