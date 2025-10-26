import { db } from "@/lib/db";
import { taskDict as taskDictTable, tasks as tasksTable } from "@/drizzle/schema";
import { eq, InferSelectModel } from "drizzle-orm";

export type TaskRow = InferSelectModel<typeof tasksTable>;
export type TaskDictRow = InferSelectModel<typeof taskDictTable>;
export type TaskWithDict = TaskRow & {
  taskDictDetails: TaskDictRow | null;
};

export async function getTasksByDate(date: string): Promise<TaskWithDict[]> {
  const rows = await db
    .select({
      task: tasksTable,
      taskDictDetails: taskDictTable,
    })
    .from(tasksTable)
    .leftJoin(taskDictTable, eq(tasksTable.taskDict, taskDictTable.id))
    .where(eq(tasksTable.date, date));

  return rows.map(({ task, taskDictDetails }) => ({
    ...task,
    taskDictDetails,
  }));
}
