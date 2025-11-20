import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventAVConfigRow } from "../../../lib/db/types";

export function computeEventAVConfig(event: ProcessedEvent): EventAVConfigRow {
  let lapels = event.resources.find((resource) =>
    resource.itemName.includes("Lapel")
  )?.quantity;
  let handhelds = event.resources.find((resource) =>
    resource.itemName.includes("Handheld")
  )?.quantity;
  if (lapels && lapels > 2) {
    lapels = 2;
  }
  if (!lapels) {
    lapels = 1;
  }
  if (handhelds && handhelds > 2) {
    handhelds = 2;
  }
  return {
    event: event.id,
    leftSource: null,
    rightSource: null,
    centerSource: null,
    leftDevice: null,
    rightDevice: null,
    centerDevice: null,
    handhelds: handhelds ?? 0,
    lapels: lapels ?? 0,
    clicker: true,
  };
}
