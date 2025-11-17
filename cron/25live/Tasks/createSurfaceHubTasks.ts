import {
  ProcessedEvent,
  EventResource,
} from "../events/transformRawEventsToEvents";
import { generateDeterministicId } from "../utils";
import { composeTaskIdInput, adjustTimeByMinutes } from "./utils";

export function createSurfaceHubTasks(
  event: ProcessedEvent,
  resource: EventResource,
) {
  return [
    {
      id: generateDeterministicId(
        composeTaskIdInput(event.id, "NEAT BOARD DEPLOY", event.startTime),
      ),
      taskType: "NEAT BOARD DEPLOY",
      date: event.date,
      startTime: adjustTimeByMinutes(event.startTime, -30),
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      resource: resource.itemName,
      room: event.roomName,
      taskDict: "NEAT BOARD DEPLOY",
    },
    {
      id: generateDeterministicId(
        composeTaskIdInput(event.id, "NEAT BOARD RETRIEVAL", event.endTime),
      ),
      taskType: "NEAT BOARD RETRIEVAL",
      date: event.date,
      startTime: adjustTimeByMinutes(event.endTime, 30),
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      resource: resource.itemName,
      room: event.roomName,
      taskDict: "NEAT BOARD RETRIEVAL",
    },
  ];
}
