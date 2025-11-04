import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import type { TaskWithDict } from "./tasks";

export async function getTaskById(
  taskId: string
): Promise<TaskWithDict | null> {
  const numericId = Number(taskId);
  if (!Number.isInteger(numericId)) {
    return null;
  }

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
      captureQcs: true,
    },
  });

  if (!task) {
    return null;
  }

  const { taskDict, event, profile_completedBy, captureQcs, ...taskData } = task;
  const normalizedResourceId =
    typeof taskData.resource === "string" && taskData.resource.trim().length > 0
      ? taskData.resource.trim()
      : null;

  return {
    ...taskData,
    taskDictDetails: taskDict ?? null,
    completedByProfile: profile_completedBy ?? null,
    captureQcDetails: captureQcs?.[0] ?? null,
    eventDetails: event
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
      : null,
  };
}
