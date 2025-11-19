import {
  generateDeterministicId,
  composeActionIdInput,
  adjustTimeByMinutes,
} from "./utils";
import {
  type ProcessedEvent,
  type EventHybridRow,
} from "../../../lib/db/types";

export function makeStaffAssistanceActions(
  event: ProcessedEvent,
  eventHybridRow: EventHybridRow | undefined
) {
  const staffAssistanceResource = event.resources.find((resource) =>
    resource.itemName.includes("Staff Assistance")
  );
  if (eventHybridRow || staffAssistanceResource) {
    return [
      {
        id: generateDeterministicId(
          composeActionIdInput(event.id, "STAFF ASSISTANCE", "Session Setup")
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
  return [];
}
