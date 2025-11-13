import {
  generateDeterministicId,
  composeActionIdInput,
  adjustTimeByMinutes,
} from "./utils";
import {
  type ProcessedEvent,
  type PropertiesEventRow,
} from "../../../lib/db/types";

export function createStaffAssistanceActions(
  event: ProcessedEvent,
  eventProperties: PropertiesEventRow[]
) {
  if (
    !eventProperties.some(
      (property) =>
        property.propertiesDict === "Staff Assistance" ||
        property.propertiesDict === "Hybrid" ||
        property.propertiesDict === "First Session"
    )
  ) {
    return [];
  }
  return [
    {
      id: generateDeterministicId(
        composeActionIdInput(event.id, "STAFF ASSISTANCE", event.startTime)
      ),
      type: "STAFF ASSISTANCE",
      subType: "Session Setup",
      date: event.date,
      startTime: adjustTimeByMinutes(event.startTime, -7.5),
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      room: event.roomName,
    },
  ];
}
