import {
  type ProcessedEvent,
  type ActionRow,
  type EventAVConfigRow,
  type EventOtherHardwareRow,
} from "../../../lib/db/types";
import {
  generateDeterministicId,
  composeActionIdInput,
  adjustTimeByMinutes,
} from "./utils";

export function makeConfigActions(
  event: ProcessedEvent,
  eventAVConfigRow: EventAVConfigRow,
  eventOtherHardwareRows: EventOtherHardwareRow[]
) {
  const hasTransformProperty = event.transform;
  const hasOtherHardware = eventOtherHardwareRows.length > 0;
  // Check if there's a "Lapel Mic(s)" with quantity > 1
  const hasTwoLapelMics = (eventAVConfigRow.lapels ?? 0) > 1;
  const hasHandheldMics = (eventAVConfigRow.handhelds ?? 0) >= 1;
  const shouldCreateSetAction =
    hasTwoLapelMics ||
    hasHandheldMics ||
    hasOtherHardware ||
    hasTransformProperty;
  const shouldCreateStrikeAction =
    hasTwoLapelMics || hasHandheldMics || hasOtherHardware;
  if (!shouldCreateSetAction && !shouldCreateStrikeAction) {
    return [];
  }
  const actionStartTime = adjustTimeByMinutes(event.startTime, -7.5);

  const configActionSet: ActionRow = {
    id: generateDeterministicId(
      composeActionIdInput(event.id, "CONFIG", "Set")
    ),
    type: "CONFIG",
   
    startTime: actionStartTime,
    createdAt: new Date().toISOString(),
    status: "pending",
    assignedTo: null,
    completedBy: null,
    event: event.id,

    subType: "Set",
    source: "25Live",
  };

  if (shouldCreateStrikeAction) {
    const configActionStrike: ActionRow = {
      id: generateDeterministicId(
        composeActionIdInput(event.id, "CONFIG", "Strike")
      ),
      type: "CONFIG",
      
      startTime: actionStartTime,
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
 
      subType: "Strike",
      source: "25Live",
    };
    return [configActionSet, configActionStrike];
  }
  return [configActionSet];
}
