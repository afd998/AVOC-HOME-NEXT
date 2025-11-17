import { type ProcessedEvent } from "../../../lib/db/types";

export type CombinedModeType = "COMBINE" | "UNCOMBINE";
export const TRANSFORM_DICT = "Transform";

const COMBINED_ROOMS = new Set(["GH 1420&30"]);
const SPLIT_ROOMS = new Set(["GH 1420", "GH 1430"]);

const getModeForRoom = (roomName: string): CombinedModeType | null => {
  if (COMBINED_ROOMS.has(roomName)) {
    return "COMBINE";
  }

  if (SPLIT_ROOMS.has(roomName)) {
    return "UNCOMBINE";
  }

  return null;
};

export const buildTransformPlan = (events: ProcessedEvent[]) => {
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
      (entry): entry is { eventId: number; startTime: string; mode: CombinedModeType } =>
        entry !== null
    );

  if (relevant.length === 0) {
    return new Map<number, CombinedModeType>();
  }

  relevant.sort((a, b) => {
    const timeComparison = a.startTime.localeCompare(b.startTime);
    if (timeComparison !== 0) {
      return timeComparison;
    }
    return Number(a.eventId) - Number(b.eventId);
  });

  const plan = new Map<number, CombinedModeType>();
  plan.set(relevant[0].eventId, relevant[0].mode);

  for (let i = 0; i < relevant.length - 1; i += 1) {
    const current = relevant[i];
    const next = relevant[i + 1];
    if (current.mode !== next.mode) {
      plan.set(next.eventId, next.mode);
    }
  }

  return plan;
};

export const transformInstruction = (mode: CombinedModeType) =>
  mode === "COMBINE"
    ? "Combine GH 1420 & GH 1430 (1420&30 configuration)."
    : "Set GH 1420 and GH 1430 for independent operation.";
