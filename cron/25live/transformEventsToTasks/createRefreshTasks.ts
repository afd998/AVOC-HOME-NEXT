export function createRefreshTasks(events: ProcessedEvent[]) {
  return events.map((event) => {
    return {
      startTime: event.startTime,
      taskType: "REFRESH",
      event: event.id,
      room: event.roomName,
    };
  });
}