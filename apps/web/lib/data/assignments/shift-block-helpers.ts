import type {
  ShiftBlockProfile,
  ShiftBlockProfileRoom,
} from "shared";
import type {
  ProfileRow,
  RoomRow,
  ShiftBlockAssignment,
  ShiftBlockRow,
  ShiftBlockWithAssignments,
} from "./types";

export const buildRoomNameCandidates = (roomNames: string[]): string[] => {
  const candidateNames = new Set<string>();
  roomNames.forEach((n) => {
    if (typeof n !== "string") return;
    const trimmed = n.trim();
    if (!trimmed) return;
    candidateNames.add(trimmed);
    const withoutGh = trimmed.replace(/^GH\s+/i, "");
    if (withoutGh !== trimmed) {
      candidateNames.add(withoutGh);
    } else {
      candidateNames.add(`GH ${trimmed}`);
    }
  });
  return Array.from(candidateNames);
};

export const toAssignments = (
  block: ShiftBlockRow & {
    shiftBlockProfileRooms?: {
      profile?: ProfileRow | null;
      room?: RoomRow | null;
      profileId?: string;
      roomId?: number;
      profileName?: string | null;
      roomName?: string | null;
    }[];
    shiftBlockProfiles?: {
      profile?: ProfileRow | null;
    }[];
  },
  relations: ShiftBlockProfileRoom[],
  baseProfiles?: ShiftBlockProfile[]
): ShiftBlockWithAssignments => {
  const grouped = new Map<string, ShiftBlockAssignment>();

  // Seed assignments from base profiles (no rooms)
  (baseProfiles ?? []).forEach((rel) => {
    const profileObj = (rel as any).profile;
    const profileId =
      typeof rel.profile === "string"
        ? rel.profile
        : profileObj?.id ?? null;
    if (!profileId) return;
    const profileName =
      typeof rel.profile === "object" ? profileObj?.name ?? null : null;
    grouped.set(profileId, {
      user: profileId,
      name: profileName ?? profileId,
      rooms: [],
      profile:
        profileObj ?? (profileId ? { id: profileId, name: profileName ?? profileId } : null),
    });
  });

  relations.forEach((rel) => {
    const profileObj = (rel as any).profile;
    const venueObj = (rel as any).venue ?? (rel as any).room;
    const profileId =
      typeof rel.profile === "string"
        ? rel.profile
        : profileObj?.id ?? null;
    if (!profileId) return;
    const profileName =
      typeof rel.profile === "object"
        ? profileObj?.name ?? null
        : (rel as any).profileName ?? null;
    const roomName =
      typeof (rel as any).venue === "object"
        ? (rel as any).venue?.name ?? null
        : typeof (rel as any).room === "object"
          ? venueObj?.name ?? null
          : (rel as any).roomName ?? null;

    const entry =
      grouped.get(profileId) ??
      ({
        user: profileId,
        name: profileName ?? profileId,
        rooms: [],
        profile:
          profileObj ?? (profileId ? { id: profileId, name: profileName ?? profileId } : null),
      } as ShiftBlockAssignment);

    if (roomName) entry.rooms.push(roomName);
    grouped.set(profileId, entry);
  });

  return {
    ...block,
    assignments: Array.from(grouped.values()),
  };
};
