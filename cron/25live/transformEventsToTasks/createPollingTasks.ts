import {
    ProcessedEvent,
    EventResource,
  } from "../transformRawEventsToEvents/transformRawEventsToEvents";
  import { generateTaskId, adjustTimeByMinutes } from "./utils";
  export function createPollingTasks( 
    event: ProcessedEvent,
    resource: EventResource
  ) {
    return [
      {
        id: generateTaskId(event.id, "POLLING CLICKER DEPLOY", event.startTime),
        taskType: "POLLING CLICKER DEPLOY",
        date: event.date,
        startTime: adjustTimeByMinutes(event.startTime, -7.5),
        createdAt: new Date().toISOString(),
        status: "pending",
        assignedTo: null,
        completedBy: null,
        event: event.id,
        resource: resource.itemName,
        room: event.roomName,
        taskDict: "POLLING CLICKER DEPLOY",
      },
  
      {
        id: generateTaskId(event.id, "POLLING CLICKER RETRIEVAL", event.endTime),
        taskType: "POLLING CLICKER RETRIEVAL", 
        date: event.date,
        startTime: adjustTimeByMinutes(event.endTime, 7.5),
        createdAt: new Date().toISOString(),
        status: "pending",
        assignedTo: null,
        completedBy: null,
        event: event.id,
        resource: resource.itemName,
        room: event.roomName,
        taskDict: "POLLING CLICKER RETRIEVAL", 
      },
    ];
  }
  