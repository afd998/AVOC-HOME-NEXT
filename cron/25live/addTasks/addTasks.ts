import { createRecordingTasks } from "./createRecordingTasks";
import type { ProcessedEvent } from "../transformRawEventsToEvents/transformRawEventsToEvents";
import { InferInsertModel } from "drizzle-orm";
import { tasks } from "../../../drizzle/schema";
import { createCombinedModeTasks } from "./createCombinedModeTasks";
import { createRefreshTasks } from "./createRefreshTasks";
import { createFirstSessionTasks } from "./createFirstSessionTasks";
import { createStaffAssistanceTask } from "./createStaffAssistanceTask";
import { createLaptopTasks } from "./createLaptopTasks";
import { createPollingTasks } from "./createPollingTasks";
import { createWebConferenceTask } from "./createWebConferenceTask";
import { createSurfaceHubTasks } from "./createSurfaceHubTasks";
type TaskRow = InferInsertModel<typeof tasks>;

export async function transformEventsToTasks(events: ProcessedEvent[]) {
  const tasks: TaskRow[] = [];
  events.forEach((event) => {
    let staffAssistanceResource:
      | ProcessedEvent["resources"][number]
      | undefined;
    let webConferenceResource: ProcessedEvent["resources"][number] | undefined;

    event.resources.forEach((resource) => {
      const lowercaseItemName = resource.itemName?.toLowerCase() ?? "";
      if (lowercaseItemName.includes("recording")) {
        tasks.push(...createRecordingTasks(event, resource));
      }

      if (lowercaseItemName.includes("laptop")) {
        tasks.push(...createLaptopTasks(event, resource));
      }
      if (lowercaseItemName.includes("surface hub")) {
        tasks.push(...createSurfaceHubTasks(event, resource));
      }
      if (lowercaseItemName.includes("polling")) {
        tasks.push(...createPollingTasks(event, resource));
      }
      if (
        !staffAssistanceResource &&
        lowercaseItemName.includes("staff assistance")
      ) {
        staffAssistanceResource = resource;
      }

      if (
        !webConferenceResource &&
        lowercaseItemName.includes("web conference")
      ) {
        webConferenceResource = resource;
      }
    });
    if (staffAssistanceResource && webConferenceResource) {
      // Create one combined task with web conference resource and staff assistance instructions
      tasks.push(createWebConferenceTask(event, webConferenceResource));
    } else if (staffAssistanceResource) {
      tasks.push(createStaffAssistanceTask(event, staffAssistanceResource));
    } else if (webConferenceResource) {
      tasks.push(createWebConferenceTask(event, webConferenceResource));
    }
  });
  tasks.push(...createCombinedModeTasks(events));
  //tasks.push(...createRefreshTasks(events));
  tasks.push(...(await createFirstSessionTasks(events)));
  return tasks;
}
