import { type ProcessedEvent, type EventResource, PropertiesEventRow } from "../../../lib/db/types";
import { generateDeterministicId } from "../utils";
import { composeActionIdInput, adjustTimeByMinutes } from "./utils";
import { ActionRow } from "../../../lib/db/types";
export function createConfigActions(
  event: ProcessedEvent,
  eventProperties: PropertiesEventRow[]
) {
 const actions: ActionRow[] = [];
 eventProperties.forEach((property) => {
  if (property.propertiesDict === "Handheld Mic(s)") {
    actions.push(...createHandheldMicActions(event, property));
  }
 });
 return actions;
  
}
