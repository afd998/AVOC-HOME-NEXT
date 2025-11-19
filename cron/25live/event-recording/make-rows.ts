import { ProcessedEvent } from "@/lib/db/types";
import { type EventRecordingRow } from "../../../lib/db/types";

export function makeEventRecordingRows(events: ProcessedEvent[]): EventRecordingRow[] {
  const eventRecordingRows: EventRecordingRow[] = [];
  events.forEach((event) => {
    const recordingResource = event.resources.find((resource) => resource.itemName.includes("Recording"));
    if (!recordingResource) {
      return;
    }
    eventRecordingRows.push({
      event: event.id,
      type: recordingResource.itemName,
      instructions: recordingResource.instruction ?? null,
    });
  });
  return eventRecordingRows;
}