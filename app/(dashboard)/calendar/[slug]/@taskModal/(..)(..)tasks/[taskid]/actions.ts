"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getTaskById } from "@/lib/data/tasks/task";
import { addDisplayColumns } from "@/lib/data/calendar/taskscalendar";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { requireUserId } from "@/lib/auth/requireUser";

type MarkTaskCompletedPayload = {
  taskId: number;
  date: string;
};

type MarkTaskCompletedResult =
  | { success: true; task: HydratedTask | null }
  | { success: false; error: string };

export async function markTaskCompletedAction({
  taskId,
  date,
}: MarkTaskCompletedPayload): Promise<MarkTaskCompletedResult> {
  if (!Number.isInteger(taskId)) {
    return { success: false, error: "Invalid task id" };
  }

  let userId: string;
  try {
    const user = await requireUserId();
    userId = user.id;
  } catch {
    return { success: false, error: "You must be signed in to complete tasks." };
  }

  try {
    await db.execute(
      sql`update "tasks" set "status" = 'COMPLETED', "completed_time" = now(), "completed_by" = ${userId} where "id" = ${taskId}`
    );
  } catch (error) {
    console.error("[TaskAction] Failed to update task status", error);
    return { success: false, error: "Failed to update task status" };
  }

  let updatedTask: HydratedTask | null = null;
  try {
    const task = await getTaskById(String(taskId));
    if (task) {
      const [hydratedTask] = addDisplayColumns([task]);
      updatedTask = hydratedTask;
    }
  } catch (error) {
    console.error("[TaskAction] Failed to reload task details", error);
  }

  revalidateTag(`task:${taskId}`);
  revalidateTag(`calendar:${date}`);
  revalidatePath(`/calendar/${date}`);

  return { success: true, task: updatedTask };
}
