import {
  ProcessedEvent,
  EventResource,
} from "../Events/transformRawEventsToEvents";
import { generateTaskId, adjustTimeByMinutes } from "./utils";
export function createLaptopTasks(
  event: ProcessedEvent,
  resource: EventResource
) {
  return [
    {
      id: generateTaskId(event.id, "LAPTOP DEPLOY", event.startTime),
      taskType: "LAPTOP DEPLOY",
      date: event.date,
      startTime: adjustTimeByMinutes(event.startTime, -7.5),
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      resource: resource.itemName,
      room: event.roomName,
      taskDict: "LAPTOP DEPLOY",
    },

    {
      id: generateTaskId(event.id, "LAPTOP RETRIEVAL", event.endTime),
      taskType: "LAPTOP RETRIEVAL",
      date: event.date,
      startTime: adjustTimeByMinutes(event.endTime, 7.5),
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      resource: resource.itemName,
      room: event.roomName,
      taskDict: "LAPTOP RETRIEVAL",
    },
  ];
}
