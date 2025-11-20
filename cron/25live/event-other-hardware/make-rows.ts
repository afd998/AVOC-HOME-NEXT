import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventOtherHardwareRow } from "../../../lib/db/types";

export function computeEventOtherHardware(
  event: ProcessedEvent
): EventOtherHardwareRow[] {
  const otherHardwareResources = event.resources.filter(
    (resource) =>
      resource.itemName.includes("Laptop") ||
      resource.itemName.includes("KSM-KGH-AV-Surface Hub") ||
      resource.itemName.includes("KSM-KGH-AV-SRS Clickers (polling)")
  );

  return otherHardwareResources.map((resource) => ({
    event: event.id,
    otherHardwareDict: resource.itemName,
    quantity: resource.quantity ?? 1,
    instructions: resource.instruction ?? null,
  }));
}
