import { eq, InferSelectModel } from "drizzle-orm";

import {
  captureQc as captureQcTable,
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
export type CaptureQcRow = InferSelectModel<typeof captureQcTable>;

export type EventWithResourceDetails = EventRow & {
  resourceEvents: (ResourceEventRow & {
    resourcesDict: ResourceDictRow | null;
  })[];
};

export type TaskWithDict = TaskRow & {
  taskDictDetails: TaskDictRow | null;
  eventDetails: EventWithResourceDetails | null;
  completedByProfile: ProfileRow | null;
  captureQcDetails: CaptureQcRow | null;
};

export async function getTasksByDate(date: string): Promise<TaskWithDict[]> {
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
      captureQcs: true,
    },
  });

  return rows.map(
    ({ taskDict, event, profile_completedBy, captureQcs, ...taskData }) => {
      const normalizedResourceId =
        typeof taskData.resource === "string" &&
        taskData.resource.trim().length > 0
          ? taskData.resource.trim()
          : null;

      const normalizedEventDetails = event
        ? {
            ...event,
            resourceEvents:
              normalizedResourceId == null
                ? []
                : (event.resourceEvents ?? [])
                    .filter(
                      (resourceEvent) =>
                        resourceEvent.resourceId.trim() === normalizedResourceId
                    )
                    .map((resourceEvent) => ({
                      ...resourceEvent,
                      resourcesDict: resourceEvent.resourcesDict ?? null,
                    })),
          }
        : null;

      return {
        ...taskData,
        taskDictDetails: taskDict ?? null,
        eventDetails: normalizedEventDetails,
        completedByProfile: profile_completedBy ?? null,
        captureQcDetails: captureQcs?.[0] ?? null,
      };
    }
  );
}
