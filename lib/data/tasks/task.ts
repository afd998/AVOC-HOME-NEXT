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

  if (!task) {
    return null;
  }

  const { taskDictDetails, eventDetails, ...taskData } = task;
  const normalizedResourceId =
    typeof taskData.resource === "string" && taskData.resource.trim().length > 0
      ? taskData.resource.trim()
      : null;

  return {
    ...taskData,
    taskDictDetails: taskDictDetails ?? null,
    eventDetails: eventDetails
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
      : null,
  };
}
