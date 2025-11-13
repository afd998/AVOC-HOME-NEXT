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

const excludedProperties = [
  "Recording",
  "Hybrid",
  "Display Adapter",
  "Lapel Mic(s)",
];

export function createConfigActions(
  event: ProcessedEvent,
  eventProperties: PropertiesEventRow[]
) {
  const transformProperty = eventProperties.find(
    (property) => property.propertiesDict === "Transform"
  );

  // Check if there are any properties that aren't excluded
  const hasNonExcludedProperties = eventProperties.some(
    (property) => !excludedProperties.includes(property.propertiesDict)
  );

  // Check if there's a "Lapel Mic(s)" with quantity > 1
  const hasLapelMicWithQuantity = eventProperties.some(
    (property) =>
      property.propertiesDict === "Lapel Mic(s)" &&
      typeof property.quantity === "number" &&
      property.quantity > 1
  );

  const shouldCreateSetAction =
    hasNonExcludedProperties || hasLapelMicWithQuantity || !!transformProperty;
  const shouldCreateStrikeAction =
    hasNonExcludedProperties || hasLapelMicWithQuantity;
  if (!shouldCreateSetAction && !shouldCreateStrikeAction) {
    return [];
  }

  const actionStartTime = adjustTimeByMinutes(event.startTime, -7.5);

  const configActionSet: ActionRow = {
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
    subType: "Set",
  };

  if (shouldCreateStrikeAction) {
    const configActionStrike: ActionRow = {
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
      subType: "Strike",
    };
    return [configActionSet, configActionStrike];
  }
  return [configActionSet];
}
