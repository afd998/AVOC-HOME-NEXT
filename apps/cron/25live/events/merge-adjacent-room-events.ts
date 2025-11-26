import type { ProcessedEvent } from "shared";

export function mergeAdjacentRoomEvents(
  eventsList: ProcessedEvent[]
): ProcessedEvent[] {
  const eventGroups = eventsList.reduce<Record<string, ProcessedEvent[]>>(
    (groups, event) => {
      const key = `${event.date ?? ""}_${event.eventName ?? ""}_${
        event.startTime ?? ""
      }`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
      return groups;
    },
    {}
  );

  const mergedEvents: ProcessedEvent[] = [];

  Object.values(eventGroups).forEach((eventGroup) => {
    if (eventGroup.length === 1) {
      mergedEvents.push(eventGroup[0]);
      return;
    }

    const room1420 = eventGroup.find((e) => e.roomName === "GH 1420");
    const room1430 = eventGroup.find((e) => e.roomName === "GH 1430");

    const room2410A = eventGroup.find((e) => e.roomName === "GH 2410A");
    const room2410B = eventGroup.find((e) => e.roomName === "GH 2410B");

    const room2420A = eventGroup.find((e) => e.roomName === "GH 2420A");
    const room2420B = eventGroup.find((e) => e.roomName === "GH 2420B");

    const room2430A = eventGroup.find((e) => e.roomName === "GH 2430A");
    const room2430B = eventGroup.find((e) => e.roomName === "GH 2430B");

    const processedEvents = new Set<ProcessedEvent>();

    if (room1420 && room1430) {
      mergedEvents.push({
        ...room1420,
        roomName: "GH 1420&30",
      });
      processedEvents.add(room1420);
      processedEvents.add(room1430);
    }

    if (room2410A && room2410B) {
      mergedEvents.push({
        ...room2410A,
        roomName: "GH 2410A&B",
      });
      processedEvents.add(room2410A);
      processedEvents.add(room2410B);
    } else if (room2410A || room2410B) {
      const singleEvent = room2410A || room2410B;
      if (singleEvent) {
        mergedEvents.push(singleEvent);
        processedEvents.add(singleEvent);
      }
    }

    if (room2420A && room2420B) {
      mergedEvents.push({
        ...room2420A,
        roomName: "GH 2420A&B",
      });
      processedEvents.add(room2420A);
      processedEvents.add(room2420B);
    }

    if (room2430A && room2430B) {
      mergedEvents.push({
        ...room2430A,
        roomName: "GH 2430A&B",
      });
      processedEvents.add(room2430A);
      processedEvents.add(room2430B);
    }

    eventGroup.forEach((event) => {
      if (!processedEvents.has(event)) {
        mergedEvents.push(event);
      }
    });
  });

  return mergedEvents;
}
