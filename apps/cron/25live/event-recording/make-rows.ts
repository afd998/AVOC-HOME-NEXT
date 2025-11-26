import { type ProcessedEvent, type EventRecordingRow } from "shared";

export function computeEventRecording(
  event: ProcessedEvent
): EventRecordingRow | undefined {
  const recordingResource = event.resources.find((resource) =>
    resource.itemName.includes("Recording")
  );
  if (!recordingResource) {
    return undefined;
  }
  return {
    event: event.id,
    type: recordingResource.itemName,
    instructions: recordingResource.instruction ?? null,
  };
}