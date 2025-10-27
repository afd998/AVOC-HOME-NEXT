import { createRecordingTasks } from "./createRecordingTasks";
import type { ProcessedEvent } from "../transformRawEventsToEvents/transformRawEventsToEvents";
import { InferInsertModel } from "drizzle-orm";
import { tasks } from "../../../drizzle/schema";
import { createCombinedModeTasks } from "./createCombinedModeTasks";
import { createRefreshTasks } from "./createRefreshTasks";
import { createFirstSessionTasks } from "./createFirstSessionTasks";
import { createStaffAssistanceTask } from "./createStaffAssistanceTask";
type TaskRow = InferInsertModel<typeof tasks>;

export async function transformEventsToTasks(events: ProcessedEvent[]) {
  const tasks: TaskRow[] = [];
  events.forEach((event) => {
    event.resources.forEach((resource) => {
      const lowercaseItemName = resource.itemName?.toLowerCase() ?? "";
      if (lowercaseItemName.includes("recording")) {
        tasks.push(...createRecordingTasks(event, resource));
      }
      if (lowercaseItemName.includes("staff assistance")) {
        tasks.push(createStaffAssistanceTask(event, resource));
      }
    });
  });
  tasks.push(...createCombinedModeTasks(events));
  //tasks.push(...createRefreshTasks(events));
  tasks.push(...(await createFirstSessionTasks(events)));
  return tasks;
}
