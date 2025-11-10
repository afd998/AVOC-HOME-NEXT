import { createCaptureQCTasks } from "./createCaptureQCActions";
import { createStaffAssistanceTask } from "./createStaffAssistanceTask";
import { createConfigActions } from "./config/createConfigActions";
import { createWebConferenceTask } from "./createWebConferenceTask";
import { createFirstSessionTasks } from "../Tasks/createFirstSessionTasks";
import { PropertiesEventRow, type ActionRow } from "../../../lib/db/types";
import { type ProcessedEvent, type EventResource } from "../../../lib/db/types";

export async function getActions(
  events: ProcessedEvent[],
  propertiesEvents: PropertiesEventRow[]
): Promise<ActionRow[]> {
  const actions: ActionRow[] = [];
  events.forEach((event) => {
    const eventProperties = propertiesEvents.filter(
      (property) => property.event === event.id
    );
    actions.push(...createConfigActions(event, eventProperties));
    let staffAssistanceResource: EventResource | undefined;
    let webConferenceResource: EventResource | undefined;
    event.resources.forEach((resource) => {
      const lowercaseItemName = resource.itemName?.toLowerCase() ?? "";
      if (lowercaseItemName.includes("recording")) {
        actions.push(...createCaptureQCTasks(event, resource));
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
      actions.push(createWebConferenceTask(event, webConferenceResource));
    } else if (staffAssistanceResource) {
      actions.push(createStaffAssistanceTask(event, staffAssistanceResource));
    } else if (webConferenceResource) {
      actions.push(createWebConferenceTask(event, webConferenceResource));
    }
  });
  actions.push(...(await createFirstSessionTasks(events)));
  return actions;
}
