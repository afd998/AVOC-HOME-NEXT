import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventAVConfigRow } from "../../../lib/db/types";

export function makeEventAVConfigRows(
  events: ProcessedEvent[]
): EventAVConfigRow[] {
  return events.map((event) => {
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
  });
}
