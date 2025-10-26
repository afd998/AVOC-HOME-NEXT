import { tasks as tasksTable } from "../../drizzle/schema";
import { and, eq, inArray, sql, type InferInsertModel } from "drizzle-orm";
import { db } from "../../lib/db";
type TaskRow = InferInsertModel<typeof tasksTable>;
export async function saveTasks(incoming: TaskRow[] , date: string) {
  console.log(`\n📝 Saving tasks for date: ${date}`);
  console.log(`📊 Incoming tasks: ${incoming.length}`);

  // Fetch existing tasks for the date
  const existing = await db
    .select({ id: tasksTable.id })
    .from(tasksTable)
    .where(eq(tasksTable.date, date));

  const existingIds = existing.map((r) => r.id);
  const incomingIds = new Set(incoming.map((t) => t.id).filter((id): id is number => typeof id === "number"));

  // Determine which existing tasks should be removed (no longer present in input)
  const toDelete = existingIds.filter((id) => !incomingIds.has(id));
  console.log(`🗑️  Tasks to delete: ${toDelete.length}`);

  if (toDelete.length > 0) {
    await db
      .delete(tasksTable)
      .where(and(eq(tasksTable.date, date), inArray(tasksTable.id, toDelete)));
    console.log(`✅ Deleted ${toDelete.length} obsolete tasks`);
  }

  if (incoming.length === 0) {
    console.log(`⚠️  No tasks to upsert for ${date}`);
    return;
  }

  // Upsert incoming tasks by primary key (id)
  console.log(`💾 Upserting ${incoming.length} tasks...`);
  await db
    .insert(tasksTable)
    .values(incoming)
    .onConflictDoUpdate({
      target: tasksTable.id,
      set: {
        // do not update createdAt
        date: sql`excluded.date`,
        taskDict: sql`excluded.task_dict`,
        event: sql`excluded.event`,
        taskType: sql`excluded.task_type`,
        startTime: sql`excluded.start_time`,
        status: sql`excluded.status`,
        assignedTo: sql`excluded.assigned_to`,
        completedBy: sql`excluded.completed_by`,
        resource: sql`excluded.resource`,
        room: sql`excluded.room`,
      },
    });
  console.log(`✅ Upserted tasks for ${date}`);
}



//event-id, starttime, tasktype. 
