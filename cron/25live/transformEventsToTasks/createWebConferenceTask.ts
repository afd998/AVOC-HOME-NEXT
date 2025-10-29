import { generateTaskId, adjustTimeByMinutes } from "./utils";
import {
  type ProcessedEvent,
  type EventResource,
} from "../transformRawEventsToEvents/transformRawEventsToEvents";

export function createWebConferenceTask(
  event: ProcessedEvent,
  resource: EventResource,
) {
  return {
    id: generateTaskId(event.id, "ZOOM SETUP", event.startTime),
    taskType: "ZOOM SETUP",
    date: event.date,
    startTime: adjustTimeByMinutes(event.startTime, -7.5),
    createdAt: new Date().toISOString(),
    status: "pending",
    assignedTo: null,
    completedBy: null,
    event: event.id,
    resource: resource.itemName,
    room: event.roomName,
    taskDict: "ZOOM SETUP",
  };
}

