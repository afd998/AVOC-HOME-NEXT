import { generateTaskId, adjustTimeByMinutes } from "./utils";
import {
  type ProcessedEvent,
  type EventResource,
} from "../transformRawEventsToEvents/transformRawEventsToEvents";

export function createStaffAssistanceTask(
  event: ProcessedEvent,
  resource: EventResource
) {
  return {
    id: generateTaskId(event.id, "STAFF ASSISTANCE", event.startTime),
    taskType: "STAFF ASSISTANCE",
    date: event.date,
    startTime: adjustTimeByMinutes(event.startTime, -7.5),
    createdAt: new Date().toISOString(),
    status: "pending",
    assignedTo: null,
    completedBy: null,
    event: event.id,
    resource: resource.itemName,
    room: event.roomName,
    taskDict: "STAFF ASSISTANCE",
  };
}
