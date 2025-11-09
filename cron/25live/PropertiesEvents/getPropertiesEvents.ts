import { type ProcessedEvent } from "../../../lib/db/types";
import { type PropertiesEventRow } from "../../../lib/db/types";
export function getPropertiesEvents(
  events: ProcessedEvent[]
): PropertiesEventRow[] {
  let propertiesEvents: PropertiesEventRow[] = [];
  events.forEach((event) => {
    event.resources.forEach((resource) => {
      if (resource.itemName.includes("Recording")) {
        const type = resource.itemName.includes("PRIVATE")
          ? "Private Link"
          : resource.itemName.includes("CANVAS")
          ? "Post to Canvas"
          : "Default";
        propertiesEvents.push({
          propertiesDict: "Recording",
          event: event.id,
          type: type,
          quantity: 1,
          instruction: resource.instruction ?? "",
        });
      }
      if (resource.itemName.includes("Properties")) {
        propertiesEvents.push({
          propertiesDict: resource.itemName,
          event: event.id,
          quantity: resource.quantity ?? 1,
          instruction: resource.instruction ?? "",
        });
      }
    });
  });
  return propertiesEvents;
}
