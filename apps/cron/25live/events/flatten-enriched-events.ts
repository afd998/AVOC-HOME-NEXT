import {
  type EnrichedEvent,
  type EventHybridRow,
  type EventAVConfigRow,
  type EventOtherHardwareRow,
  type EventRecordingRow,
} from "shared";

export function flattenEnrichedEvents(enrichedEvents: EnrichedEvent[]) {
  const eventHybridRows: EventHybridRow[] = [];
  const eventAVConfigRows: EventAVConfigRow[] = [];
  const eventOtherHardwareRows: EventOtherHardwareRow[] = [];
  const eventRecordingRows: EventRecordingRow[] = [];

  enrichedEvents.forEach((event) => {
    if (event.hybrid) {
      eventHybridRows.push(event.hybrid);
    }
    eventAVConfigRows.push(event.avConfig);
    eventOtherHardwareRows.push(...event.otherHardware);
    if (event.recording) {
      eventRecordingRows.push(event.recording);
    }
  });

  return {
    eventHybridRows,
    eventAVConfigRows,
    eventOtherHardwareRows,
    eventRecordingRows,
  };
}

