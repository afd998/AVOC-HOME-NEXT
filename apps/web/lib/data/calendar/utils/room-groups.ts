import type { Room } from "shared";

export type RoomGroup<T> = {
  roomName: string;
  events: T[];
  venueId: number | null;
  room?: Room | null;
  /**
   * Some rows (e.g., split rooms from a merged "A&B" event) should remain
   * visible even when auto-hide is enabled.
   */
  forceVisible?: boolean;
};

type RoomishEvent = {
  roomName: string;
  room?: Room | null;
  venue?: number | null;
};

export function groupEventsByRoom<T extends RoomishEvent>(
  events: T[]
): RoomGroup<T>[] {
  const groupedEvents = events.reduce((acc, event) => {
    const roomName = event.roomName;
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(event);
    return acc;
  }, {} as Record<string, T[]>);

  return Object.entries(groupedEvents).map(([roomName, roomEvents]) => {
    const room = roomEvents.find((event) => event.room)?.room ?? null;
    const venueId =
      room?.id ??
      (roomEvents.find((event) => typeof event.venue === "number")?.venue ??
        null);

    return {
      roomName,
      events: roomEvents,
      venueId,
      room,
    };
  });
}

export function handleMergedRooms<T>(
  roomGroups: RoomGroup<T>[]
): RoomGroup<T>[] {
  const existingRoomNames = new Set(roomGroups.map((group) => group.roomName));
  roomGroups.forEach((group) => {
    if (!group.roomName.includes("&")) return;

    const expandedNames = expandMergedRoomNames(group.roomName).slice(1);
    expandedNames.forEach((name) => {
      if (existingRoomNames.has(name)) return;
      const emptyGroup: RoomGroup<T> = {
        roomName: name,
        events: [],
        venueId: group.venueId ?? null,
        room: group.room ?? null,
        forceVisible: true,
      };
      roomGroups.push(emptyGroup);
      existingRoomNames.add(name);
    });
  });

  for (let i = roomGroups.length - 1; i >= 0; i--) {
    const room = roomGroups[i];
    if (!room.roomName.includes("&")) continue;

    const baseRoomName = room.roomName.split("&")[0].trim();
    const targetIndex = roomGroups.findIndex(
      (candidate) => candidate.roomName === baseRoomName
    );

    if (targetIndex !== -1) {
      roomGroups[targetIndex].events = [
        ...roomGroups[targetIndex].events,
        ...room.events,
      ];

      if (!roomGroups[targetIndex].venueId && room.venueId) {
        roomGroups[targetIndex].venueId = room.venueId;
        roomGroups[targetIndex].room =
          room.room ?? roomGroups[targetIndex].room ?? null;
      }
    } else {
      roomGroups.push({
        roomName: baseRoomName,
        events: [...room.events],
        venueId: room.venueId ?? null,
        room: room.room ?? null,
      });
    }

    roomGroups.splice(i, 1);
  }

  return roomGroups;
}

export function expandMergedRoomNames(roomName: string): string[] {
  const trimmedName = roomName.trim();
  if (!trimmedName.includes("&")) {
    return [trimmedName];
  }

  const segments = trimmedName.split("&").map((segment) => segment.trim());
  const [firstSegment, ...restSegments] = segments;

  if (!firstSegment) {
    return [trimmedName];
  }

  const lastSpaceIndex = firstSegment.lastIndexOf(" ");
  const prefix =
    lastSpaceIndex >= 0 ? firstSegment.slice(0, lastSpaceIndex + 1) : "";
  const baseSuffix = firstSegment.slice(lastSpaceIndex + 1);

  const expandedSegments = [firstSegment];

  restSegments.forEach((segment) => {
    if (!segment) return;

    if (segment.includes(" ")) {
      expandedSegments.push(segment);
      return;
    }

    if (baseSuffix.length >= segment.length && baseSuffix.length > 0) {
      const mergedSuffix =
        baseSuffix.slice(0, baseSuffix.length - segment.length) + segment;
      expandedSegments.push(`${prefix}${mergedSuffix}`);
      return;
    }

    expandedSegments.push(`${prefix}${segment}`);
  });

  return expandedSegments;
}
