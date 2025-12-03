import {
  generateDeterministicId,
  composeActionIdInput,
  adjustTimeByMinutes,
  type ProcessedEvent,
  type EventHybridRow,
} from "shared";

export function makeStaffAssistanceActions(
  event: ProcessedEvent,
  eventHybridRow: EventHybridRow | undefined
) {
  const staffAssistanceResource = event.resources.find((resource) =>
    resource.itemName.includes("Staff Assistance")
  );
  console.log("hybrid row", eventHybridRow);
  if (eventHybridRow || staffAssistanceResource) {
    return [
      {
        id: generateDeterministicId(
          composeActionIdInput(event.id, "STAFF ASSISTANCE", "Session Setup")
        ),
        type: "STAFF ASSISTANCE",
        subType: "Session Setup",
        startTime: adjustTimeByMinutes(event.startTime, -7.5),
        createdAt: new Date().toISOString(),
        status: "pending",
        assignedTo: null,
        completedBy: null,
        event: event.id,
        source: "25Live",
      },
    ];
  }
  return [];
}
