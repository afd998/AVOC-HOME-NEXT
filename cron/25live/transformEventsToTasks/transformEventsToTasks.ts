import { createRecordingTasks } from "./createRecordingTasks";
import type { ProcessedEvent } from "../transformRawEventsToEvents/transformRawEventsToEvents";

export function transformEventsToTasks(events: ProcessedEvent[]) {
  return events.map((event) => {
    event.resources.map((resource) => {
      const lowercaseItemName = resource.itemName?.toLowerCase() ?? "";
      if (lowercaseItemName.includes("recording")) {
        return createRecordingTasks(event, resource);
      }
    });
  });
}
