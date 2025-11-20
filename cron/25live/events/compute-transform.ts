import { type ProcessedEvent } from "../../../lib/db/types";

export type TransformType = "COMBINE" | "UNCOMBINE";

const COMBINED_ROOMS = new Set(["GH 1420&30"]);
const SPLIT_ROOMS = new Set(["GH 1420", "GH 1430"]);

const getModeForRoom = (roomName: string): TransformType | null => {
  if (COMBINED_ROOMS.has(roomName)) {
    return "COMBINE";
  }

  if (SPLIT_ROOMS.has(roomName)) {
    return "UNCOMBINE";
  }

  return null;
};

export function computeTransforms(events: ProcessedEvent[]): Map<number, TransformType> {
  const relevant = events
    .map((event) => {
      const mode = getModeForRoom(event.roomName);
      if (!mode) {
        return null;
      }

      return {
        eventId: event.id,
        startTime: event.startTime,
        mode,
      };
    })
    .filter(
      (entry): entry is { eventId: number; startTime: string; mode: TransformType } =>
        entry !== null
    );

  if (relevant.length === 0) {
    return new Map<number, TransformType>();
  }

  relevant.sort((a, b) => {
    const timeComparison = a.startTime.localeCompare(b.startTime);
    if (timeComparison !== 0) {
      return timeComparison;
    }
    return Number(a.eventId) - Number(b.eventId);
  });

  const plan = new Map<number, TransformType>();
  plan.set(relevant[0].eventId, relevant[0].mode);

  for (let i = 0; i < relevant.length - 1; i += 1) {
    const current = relevant[i];
    const next = relevant[i + 1];
    if (current.mode !== next.mode) {
      plan.set(next.eventId, next.mode);
    }
  }

  return plan;
}

