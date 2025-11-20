import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventAVConfigRow } from "../../../lib/db/types";

export function computeEventAVConfig(
  event: ProcessedEvent
): EventAVConfigRow {
  return {
    event: event.id,
    leftSource: null,
    rightSource: null,
    centerSource: null,
    leftDevice: null,
    rightDevice: null,
    centerDevice: null,
    handhelds: 0,
    lapels: 0,
    clicker: true,
  };
}
