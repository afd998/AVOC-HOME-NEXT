import { eq, InferSelectModel } from "drizzle-orm";

import {
  qcs as captureQcTable,
  events as eventsTable,
  profiles as profilesTable,
  resourceEvents as resourceEventsTable,
  resourcesDict as resourcesDictTable,
  taskDict as taskDictTable,
  tasks as tasksTable,
} from "@/drizzle/schema";
import { db } from "@/lib/db";

export type TaskRow = InferSelectModel<typeof tasksTable>;
export type TaskDictRow = InferSelectModel<typeof taskDictTable>;
export type EventRow = InferSelectModel<typeof eventsTable>;
export type ResourceEventRow = InferSelectModel<typeof resourceEventsTable>;
export type ResourceDictRow = InferSelectModel<typeof resourcesDictTable>;
export type ProfileRow = InferSelectModel<typeof profilesTable>;
export type QcRow = InferSelectModel<typeof captureQcTable>;

export type EventWithResourceDetails = EventRow & {
  resourceEvents: (ResourceEventRow & {
    resourcesDict: ResourceDictRow | null;
  })[];
};

export type TaskWithDict = TaskRow & {
  taskDictDetails: TaskDictRow | null;
  eventDetails: EventWithResourceDetails | null;
  completedByProfile: ProfileRow | null;
  captureQcDetails: QcRow | null;
};

export async function getTasksByDate(date: string): Promise<TaskWithDict[]> {
  try {
    const rows = await db.query.tasks.findMany({
      where: eq(tasksTable.date, date),
      with: {
        taskDict: true,
        event: {
          with: {
            resourceEvents: {
              with: {
                resourcesDict: true,
              },
            },
          },
        },
        profile_completedBy: true,
        qcs: true,
      },
    });

  return rows.map(
    ({ taskDict, event, profile_completedBy, qcs, ...taskData }) => {
      const normalizedResourceId =
        typeof taskData.resource === "string" && taskData.resource.trim().length > 0
          ? taskData.resource.trim()
          : null;

      const eventWithResources = event as EventWithResourceDetails | null;

      return {
        ...taskData,
        taskDictDetails: taskDict ?? null,
        eventDetails: eventWithResources
          ? {
              ...eventWithResources,
              resourceEvents:
                normalizedResourceId == null
                  ? []
                  : (eventWithResources.resourceEvents ?? [])
                      .filter(
                        (resourceEvent) =>
                          resourceEvent.resourceId?.trim() === normalizedResourceId
                      )
                      .map((resourceEvent) => ({
                        ...resourceEvent,
                        resourcesDict: resourceEvent.resourcesDict ?? null,
                      })),
            }
          : null,
        completedByProfile: profile_completedBy ?? null,
        captureQcDetails: qcs?.[0] ?? null,
      } as TaskWithDict;
    }
  );
  } catch (error: any) {
    // Log comprehensive error details
    console.error("[getTasksByDate] Query error details:", {
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
      console.error("[getTasksByDate] PostgreSQL error:", {
        code: pgError.code,
        message: pgError.message,
        detail: pgError.detail,
        hint: pgError.hint,
      });
    }
    
    throw error;
  }
}
