import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import type { TaskWithDict, EventWithResourceDetails } from "./tasks";

export async function getTaskById(
  taskId: string
): Promise<TaskWithDict | null> {
  const numericId = Number(taskId);

  const task = await db.query.tasks.findFirst({
    where: eq(tasksTable.id, numericId),
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
      qcs: {
        with: {
          qcItems: {
            with: {
              qcItemDict: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  const { taskDict, event, profile_completedBy, qcs, ...taskData } = task;
  const normalizedResourceId =
    typeof taskData.resource === "string" && taskData.resource.trim().length > 0
      ? taskData.resource.trim()
      : null;

  const eventWithResources = event as EventWithResourceDetails | null;

  const eventDetails = eventWithResources
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
    : null;

  return {
    ...taskData,
    taskDictDetails: taskDict ?? null,
    completedByProfile: profile_completedBy ?? null,
    captureQcDetails: qcs?.[0] ?? null,
    eventDetails,
  } as unknown as TaskWithDict;
}
