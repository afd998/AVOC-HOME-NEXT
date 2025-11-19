import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventOtherHardwareRow } from "../../../lib/db/types";

export function makeEventOtherHardwareRows(
  events: ProcessedEvent[]
): EventOtherHardwareRow[] {
  const eventOtherHardwareRows: EventOtherHardwareRow[] = [];
  events.forEach((event) => {
    const otherHardwareResources = event.resources.filter(
      (resource) =>
        resource.itemName.includes("Laptop") ||
        resource.itemName.includes("KSM-KGH-AV-Surface Hub") ||
        resource.itemName.includes("KSM-KGH-AV-SRS Clickers (polling)")
    );
    if (otherHardwareResources.length < 0) {
      return;
    }

    otherHardwareResources.forEach((resource) => {
      eventOtherHardwareRows.push({
        event: event.id,
        otherHardwareDict: resource.itemName,
        quantity: resource.quantity ?? 1,
        instructions: resource.instruction ?? null,
      });
    });
  });
  return eventOtherHardwareRows;
}
