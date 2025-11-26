import { type ActionRow, type EnrichedEvent } from "shared";
import { makeConfigActions } from "./make-config-actions";
import { makeStaffAssistanceActions } from "./make-staff-assistance-actions";
import { makeCaptureQCActions } from "./make-capture-qc-actions";

export async function getActions(
  enrichedEvents: EnrichedEvent[]
): Promise<ActionRow[]> {
  const actions: ActionRow[] = [];
  enrichedEvents.forEach((event) => {
    actions.push(...makeConfigActions(event, event.avConfig, event.otherHardware));
    actions.push(...makeStaffAssistanceActions(event, event.hybrid));
    actions.push(...makeCaptureQCActions(event, event.recording));
  });
  return actions;
}
