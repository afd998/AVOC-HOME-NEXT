"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getTaskById } from "@/lib/data/tasks/task";
import { addDisplayColumns } from "@/lib/data/calendar/taskscalendar";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { requireUserId } from "@/lib/auth/requireUser";
import { saveCaptureQcItemsAction } from "./qcActions";
import type { InferInsertModel } from "drizzle-orm";
import { qcItems } from "@/drizzle/schema";

export type QCItemInsert = InferInsertModel<typeof qcItems>;

type MarkTaskCompletedPayload = {
  taskId: number;
  date: string;
  qcItemsData?: QCItemInsert[];
};

type MarkTaskCompletedResult =
  | { success: true; task: HydratedTask | null }
  | { success: false; error: string };

export async function markTaskCompletedAction({
  taskId,
  date,
  qcItemsData,
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

  // Save QC items if provided
  if (qcItemsData && qcItemsData.length > 0) {
    const qcResult = await saveCaptureQcItemsAction({
      taskId,
      qcItemsData,
    });
    if (!qcResult.success) {
      // Note: Task is already marked complete, but QC items failed
      // We still return success for task completion, but log the QC error
      console.error("[TaskAction] Failed to save QC items", qcResult.error);
    }
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

  revalidateTag(`task:${taskId}`, "page");
  revalidateTag(`calendar:${date}`, "page");
  revalidatePath(`/calendar/${date}`, "page");

  return { success: true, task: updatedTask };
}
