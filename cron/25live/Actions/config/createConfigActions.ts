import {
  type ProcessedEvent,
  type PropertiesEventRow,
  type ActionRow,
} from "../../../../lib/db/types";
import {
  generateDeterministicId,
  composeActionIdInput,
  adjustTimeByMinutes,
} from "../utils";
const formatPropertyInstruction = (property: PropertiesEventRow) => {
  const hasQuantity =
    typeof property.quantity === "number" && property.quantity > 0;
  const quantityPrefix = hasQuantity ? `${property.quantity}× ` : "";
  const baseLine = `${quantityPrefix}${property.propertiesDict}`;
  const extra = property.instruction?.trim();

  return extra ? `${baseLine}: ${extra}` : baseLine;
};

export function createConfigActions(
  event: ProcessedEvent,
  eventProperties: PropertiesEventRow[]
) {
  const actionTriggeringProperties = eventProperties.filter(
    (property) =>
      property.propertiesDict !== "Recording" &&
      property.propertiesDict !== "Hybrid" &&
      property.propertiesDict !== "Display Adapter" &&
      property.propertiesDict !== "Transform"
  );

  const shouldCreateAction = actionTriggeringProperties.length > 0;

  if (!shouldCreateAction) {
    return [];
  }

  const actionStartTime = adjustTimeByMinutes(event.startTime, -7.5);
  const instructionParts: string[] = [];

  if (actionTriggeringProperties.length > 0) {
    instructionParts.push(
      actionTriggeringProperties.map(formatPropertyInstruction).join("\n")
    );
  }

  const instructions = instructionParts.join("\n\n") || null;

  const configAction: ActionRow = {
    id: generateDeterministicId(
      composeActionIdInput(event.id, "CONFIG", actionStartTime)
    ),
    type: "CONFIG",
    date: event.date,
    startTime: actionStartTime,
    createdAt: new Date().toISOString(),
    status: "pending",
    assignedTo: null,
    completedBy: null,
    event: event.id,
    room: event.roomName,
    taskDict: "CONFIG",
    instructions,
    subType: transformProperty?.type ?? null,  
  }; 

  return [configAction];
}
