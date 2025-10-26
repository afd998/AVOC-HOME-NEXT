import { ProcessedEvent } from "../transformRawEventsToEvents/transformRawEventsToEvents";
import { generateTaskId } from "./taskId";
export function createCombinedModeTasks(events: ProcessedEvent[]) {
  //create sorted array by time of 1420 or 30 events and 1420 and 30 events  and in between each transition
  //and also the begining, create a n uncombine/combine task at that time.

  //get only 1420&30 events
  const filteredEvents = events.filter(
    (event) =>
      event.roomName === "GH 1420&30" ||
      event.roomName === "GH 1430" ||
      event.roomName === "GH 1420"
  );

  const eventsWithType = filteredEvents.map((event) => {
    return {
      time: event.startTime,
      endTime: event.endTime,
      type: event.roomName === "GH 1420&30" ? "COMBINE" : "UNCOMBINE",
      eventId: event.id,
      room: event.roomName,
    };
  });

  const sorted = eventsWithType.sort((a, b) => {
    return a.time.localeCompare(b.time);
  });


  const tasks = [];

  tasks.push({
    startTime: sorted[0].time,
    taskType: sorted[0].type,
    event: sorted[0].eventId,
    room: sorted[0].room,
  });

  for (let i = 0; i < sorted.length-1; i++) {
    const e = sorted[i];
    const nextEvent = sorted[i + 1];
    if (e.type !== nextEvent.type) {
      tasks.push({
        startTime: e.endTime,
        taskType: nextEvent.type,
        event: e.eventId,
        room: "GH 1420&30",
      });
    }
  }

  return tasks.map((task) => {
    return {
      startTime: task.startTime,
      taskType: task.taskType,
      date: events[0].date,
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: task.event,
      resource: null,
      id: generateTaskId(task.event, task.taskType, task.startTime),
      room: task.room,
    };
  });
}
