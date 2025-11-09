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
      if (resource.itemName.includes("Laptop")) {
        propertiesEvents.push({
          propertiesDict: "Laptop(s)",
          event: event.id,
          quantity: resource.quantity ?? 1,
          instruction: resource.instruction ?? "",
        });
      }
      if (resource.itemName.includes("KSM-KGH-AV-Surface Hub")) {
        propertiesEvents.push({
          propertiesDict: "All-In-One Device(s)",
          event: event.id,
          quantity: resource.quantity ?? 1,
          instruction: resource.instruction ?? "",
        });
      }
      if (resource.itemName.includes("Adapter")) {
        propertiesEvents.push({
          propertiesDict: "Display Adapter",
          event: event.id,
          quantity: resource.quantity ?? 1,
          instruction: resource.instruction ?? "",
        });
      }
      if (resource.itemName.includes("KSM-KGH-AV-SRS Clickers (polling)")) {
        propertiesEvents.push({
          propertiesDict: "Turning Point Clickers",
          event: event.id,
          quantity: resource.quantity ?? 1,
          instruction: resource.instruction ?? "",
        });
        if (resource.itemName.includes("KSM-KGH-AV-Web Conference")) {
          propertiesEvents.push({
            propertiesDict: "Hybrid",
            event: event.id,
            quantity: 1,
            instruction: resource.instruction ?? "",
          });
        }
      }
      if (resource.itemName.includes("KSM-KGH-AV-Presentation Clicker")) {
        propertiesEvents.push({
          propertiesDict: "Presentation Clicker",
          event: event.id,
          quantity: 1,
          instruction: resource.instruction ?? "",
        });
      }
    });
  });
  return propertiesEvents;
}
