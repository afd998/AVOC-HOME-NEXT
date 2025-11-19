import { makeConfigActions } from "./make-config-actions";
import {
  type ActionRow,
  EventHybridRow,
  type ProcessedEvent,
  type EventAVConfigRow,
  type EventOtherHardwareRow,
  EventRecordingRow,
} from "../../../lib/db/types";

import { makeStaffAssistanceActions } from "./make-staff-assistance-actions";
import { makeCaptureQCActions } from "./make-capture-qc-actions";
export async function getActions(
  events: ProcessedEvent[],
  eventHybridRows: EventHybridRow[],
  eventAVConfigRows: EventAVConfigRow[],
  eventOtherHardwareRows: EventOtherHardwareRow[],
  eventRecordingRows: EventRecordingRow[]
): Promise<ActionRow[]> {
  const actions: ActionRow[] = [];
  events.forEach((event) => {
    const otherHardwareRows = eventOtherHardwareRows.filter(
      (otherHardware) => otherHardware.event === event.id
    );
    const hybridRow = eventHybridRows.find(
      (hybrid) => hybrid.event === event.id
    );
    const avConfigRow = eventAVConfigRows.find(
      (avConfig) => avConfig.event === event.id
    )!; // Always exists since makeEventAVConfigRows creates one for every event
    const recordingRow = eventRecordingRows.find(
      (recording) => recording.event === event.id
    );

    actions.push(...makeConfigActions(event, avConfigRow, otherHardwareRows));
    actions.push(...makeStaffAssistanceActions(event, hybridRow));
    actions.push(...makeCaptureQCActions(event, recordingRow));
  });
  return actions;
}
