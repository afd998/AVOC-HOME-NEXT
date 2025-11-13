import { createCaptureQCActions } from "./captureQc/createCaptureQCActions";
import { createConfigActions } from "./config/createConfigActions";
import { PropertiesEventRow, type ActionRow } from "../../../lib/db/types";
import { type ProcessedEvent } from "../../../lib/db/types";
import { createStaffAssistanceActions } from "./createStaffAssistanceActions";

export async function getActions(
  events: ProcessedEvent[],
  propertiesEvents: PropertiesEventRow[]
): Promise<ActionRow[]> {
  const actions: ActionRow[] = [];
  events.forEach((event) => {
    const eventProperties = propertiesEvents.filter(
      (property) => property.event === event.id
    );
    actions.push(...createConfigActions(event, eventProperties));
    actions.push(...createStaffAssistanceActions(event, eventProperties));
    actions.push(...createCaptureQCActions(event, eventProperties));
  });
  return actions;
}
