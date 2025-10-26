import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/drizzle/schema";
import { eq, InferSelectModel } from "drizzle-orm";
type TaskRow = InferSelectModel<typeof tasksTable>;

export async function getTasksByDate(date: string) {
  const tasksData = await db.query.tasks.findMany({
    where: eq(tasksTable.date, date),
  });
  return tasksData as TaskRow[];
}
