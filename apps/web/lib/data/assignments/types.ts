import type {
  Shift,
  ShiftBlock,
  Profile,
  Room,
} from "shared";

export type ShiftRow = Shift;
export type ShiftBlockRow = ShiftBlock;
export type ProfileRow = Profile;
export type RoomRow = Room;

export type ShiftBlockAssignment = {
  user: string;
  name?: string | null;
  rooms: string[];
};

export type ShiftBlockWithAssignments = ShiftBlockRow & {
  assignments: ShiftBlockAssignment[];
};

// API-facing payloads
export type ShiftBlockInput = {
  id?: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  assignments?: unknown;
};

export type ShiftUpsertInput = {
  profileId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
};
