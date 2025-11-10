import { type ProcessedEvent } from "../../../lib/db/types";
import { type PropertiesEventRow } from "../../../lib/db/types";
export function getPropertiesEvents(
  events: ProcessedEvent[]
): PropertiesEventRow[] {
  let propertiesEvents: PropertiesEventRow[] = [];
  events.forEach((event) => {
    let handheldMics = 0;
    let lapelMics = 0;
    event.resources.forEach((resource) => {
      if (resource.itemName.includes("Handheld")) {
        handheldMics = handheldMics + resource.quantity;
      }
      if (resource.itemName.includes("Lapel")) {
        lapelMics = lapelMics + resource.quantity;
      }
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
    const hasBoth = handheldMics > 0 && lapelMics > 0;
    if (handheldMics > 0) {
      propertiesEvents.push({
        propertiesDict: "Handheld Mic(s)",
        event: event.id,
        quantity: hasBoth ? 1 : Math.min(handheldMics, 2),
        instruction: "",
      });
    }
    if (lapelMics > 0) {
      propertiesEvents.push({
        propertiesDict: "Lapel Mic(s)",
        event: event.id,
        quantity: hasBoth ? 1 : Math.min(lapelMics, 2),
        instruction: "",
      });
    }
  });
  return propertiesEvents;
}
