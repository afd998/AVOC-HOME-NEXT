import { createCaptureQCTasks } from "./createCaptureQCTasks";
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
import { type ProcessedEvent } from "../scrape";
import { type EventResource } from "../scrape";
import { type TaskRow } from "../scrape";

export async function getTasks(events: ProcessedEvent[]): Promise<TaskRow[]> {
  const tasks: TaskRow[] = [];
  events.forEach((event) => {
    let staffAssistanceResource: EventResource | undefined;
    let webConferenceResource: EventResource | undefined;
    event.resources.forEach((resource) => {
      const lowercaseItemName = resource.itemName?.toLowerCase() ?? "";
      if (lowercaseItemName.includes("recording")) {
        tasks.push(...createCaptureQCTasks(event, resource));
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
