import { ProcessedEvent } from "../transformRawEventsToEvents/transformRawEventsToEvents";
import { generateTaskId } from "./taskId";

const adjustTimeByMinutes = (time: string, minuteDelta: number) => {
  const [hoursStr, minutesStr, secondsStr] = time.split(":");
  if (
    hoursStr === undefined ||
    minutesStr === undefined ||
    secondsStr === undefined
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondsStr);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const adjustedSeconds = Math.min(
    Math.max(totalSeconds + minuteDelta * 60, 0),
    24 * 60 * 60 - 1
  );

  const adjustedHours = Math.floor(adjustedSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const adjustedMinutes = Math.floor((adjustedSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const adjustedRemainingSeconds = (adjustedSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${adjustedHours}:${adjustedMinutes}:${adjustedRemainingSeconds}`;
};

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
    startTime: adjustTimeByMinutes(sorted[0].time, -10),
    taskType: sorted[0].type,
    event: sorted[0].eventId,
    room: sorted[0].room,
  });

  for (let i = 0; i < sorted.length-1; i++) {
    const e = sorted[i];
    const nextEvent = sorted[i + 1];
    if (e.type !== nextEvent.type) {
      tasks.push({
        startTime: adjustTimeByMinutes(e.endTime, 5),
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
      taskDict: task.taskType
    };
  });
}
