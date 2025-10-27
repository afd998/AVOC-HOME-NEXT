import { db } from "@/lib/db";
import {
  events as eventsTable,
  resourceEvents as resourceEventsTable,
  resourcesDict as resourcesDictTable,
  taskDict as taskDictTable,
  tasks as tasksTable,
} from "@/drizzle/schema";
import { eq, InferSelectModel } from "drizzle-orm";

export type TaskRow = InferSelectModel<typeof tasksTable>;
export type TaskDictRow = InferSelectModel<typeof taskDictTable>;
export type EventRow = InferSelectModel<typeof eventsTable>;
export type ResourceEventRow = InferSelectModel<typeof resourceEventsTable>;
export type ResourceDictRow = InferSelectModel<typeof resourcesDictTable>;

export type EventWithResourceDetails = EventRow & {
  resourceEvents: (ResourceEventRow & {
    resourcesDict: ResourceDictRow | null;
  })[];
};

export type TaskWithDict = TaskRow & {
  taskDictDetails: TaskDictRow | null;
  eventDetails: EventWithResourceDetails | null;
};

export async function getTasksByDate(date: string): Promise<TaskWithDict[]> {
  const rows = await db.query.tasks.findMany({
    where: eq(tasksTable.date, date),
    with: {
      taskDictDetails: true,
      eventDetails: {
        with: {
          resourceEvents: {
            with: {
              resourcesDict: true,
            },
          },
        },
      },
    },
  });

  return rows.map(({ taskDictDetails, eventDetails, ...taskData }) => {
    const normalizedResourceId =
      typeof taskData.resource === "string" &&
      taskData.resource.trim().length > 0
        ? taskData.resource.trim()
        : null;

    const normalizedEventDetails = eventDetails
      ? {
          ...eventDetails,
          resourceEvents:
            normalizedResourceId == null
              ? []
              : (eventDetails.resourceEvents ?? [])
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
      taskDictDetails: taskDictDetails ?? null,
      eventDetails: normalizedEventDetails,
    };
  });
}
