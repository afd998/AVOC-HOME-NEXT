import {
  eq,
  inArray,
  db,
  shifts,
  shiftBlocks,
  profiles,
  venues,
  asc,
  type Shift,
  type ShiftBlock,
  type Profile,
  type Room,
  shiftBlockProfileRoom,
  type ShiftBlockProfileRoom,
  shiftBlockProfile,
  type ShiftBlockProfile,
  and,
  actions,
  events,
  gte,
  lt,
} from "shared";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

// Types for the returned data
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

type ShiftBlockRoomRelationForCopy = {
  shiftBlock: number;
  profile: string;
  room: number;
  roomName?: string | null;
};

// API-facing inputs use camelCase payloads for the REST routes
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

const toAssignments = (
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
          profileId,
        } as ShiftBlockAssignment);

    if (roomName) {
      entry.rooms.push(roomName);
    }

    grouped.set(profileId, entry);
  });

  return {
    ...block,
    assignments: Array.from(grouped.values()),
  };
};

/**
 * Get all shifts for a specific date
 */
export async function getShifts(date: string): Promise<ShiftRow[]> {
  // "use cache";
  // cacheTag(`shifts:${date}`);
  try {
    const result = await db
      .select()
      .from(shifts)
      .where(eq(shifts.date, date));
    return result;
  } catch (error) {
    console.error("[db] assignments.getShifts", { date, error });
    throw error;
  }
}

/**
 * Get all shift blocks for a specific date (with assignments)
 */
export async function getShiftBlocks(
  date: string
): Promise<ShiftBlockWithAssignments[]> {
  // "use cache";
  // cacheTag(`shift_blocks:${date}`);
  try {
    const result = await db.query.shiftBlocks.findMany({
      where: eq(shiftBlocks.date, date),
      orderBy: asc(shiftBlocks.startTime),
      with: {
        shiftBlockProfileRooms: {
          with: { profile: true, venue: true },
        },
        shiftBlockProfiles: {
          with: { profile: true },
        },
      },
    });
    return result.map((block) =>
      toAssignments(
        block,
        block.shiftBlockProfileRooms ?? [],
        block.shiftBlockProfiles ?? []
      )
    );
  } catch (error) {
    console.error("[db] assignments.getShiftBlocks", { date, error });
    throw error;
  }
}

/**
 * Get all shift blocks (used for bulk operations when no date filter is provided)
 */
export async function getAllShiftBlocks(): Promise<ShiftBlockWithAssignments[]> {
  try {
    const result = await db.query.shiftBlocks.findMany({
      orderBy: [asc(shiftBlocks.date), asc(shiftBlocks.startTime)],
      with: {
        shiftBlockProfileRooms: {
          with: { profile: true, venue: true },
        },
        shiftBlockProfiles: {
          with: { profile: true },
        },
      },
    });
    return result.map((block) =>
      toAssignments(
        block,
        block.shiftBlockProfileRooms ?? [],
        block.shiftBlockProfiles ?? []
      )
    );
  } catch (error) {
    console.error("[db] assignments.getAllShiftBlocks", { error });
    throw error;
  }
}

/**
 * Reassign a set of rooms within a shift block to a target profile (or unassign).
 * This operates on the junction table rather than the JSON assignments column.
 */
export async function assignRoomsToShiftBlock(
  shiftBlockId: number,
  roomNames: string[],
  targetProfileId: string | null
): Promise<ShiftBlockWithAssignments | null> {
  let blockDateForCache: string | null = null;
  try {
    console.log("[assignRoomsToShiftBlock] start", {
      shiftBlockId,
      roomNames,
      targetProfileId,
    });
    const uniqueRoomNames = Array.from(
      new Set(
        (roomNames ?? []).filter(
          (name): name is string =>
            typeof name === "string" && name.trim().length > 0
        )
      )
    );

    // Build a set of candidate names to improve matching (raw, without GH prefix, and with GH prefix)
    const candidateNames = new Set<string>();
    uniqueRoomNames.forEach((n) => {
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
    const candidateList = Array.from(candidateNames);
    console.log("[assignRoomsToShiftBlock] candidateList", candidateList);

    const updatedBlock = await db.transaction(async (tx) => {
      const blockMeta = await tx.query.shiftBlocks.findFirst({
        where: eq(shiftBlocks.id, shiftBlockId),
        columns: { date: true, startTime: true, endTime: true },
      });
      blockDateForCache = blockMeta?.date ?? null;

      // Pull rooms once and match by normalized name to avoid casing/prefix issues
      const allRooms = await tx.select().from(venues);
      const normalize = (value: string | null | undefined) =>
        (value ?? "").trim().toLowerCase();

      const roomIdByKey = new Map<string, number>();
      allRooms.forEach((room) => {
        const base = normalize(room.name);
        if (!base) return;
        roomIdByKey.set(base, room.id as number);
        const withoutGh = base.replace(/^gh\s+/, "");
        if (withoutGh !== base) {
          roomIdByKey.set(withoutGh, room.id as number);
        } else {
          roomIdByKey.set(`gh ${base}`, room.id as number);
        }
      });

      const roomIds: number[] = [];
      candidateList.forEach((candidate) => {
        const norm = normalize(candidate);
        const match =
          roomIdByKey.get(norm) ??
          roomIdByKey.get(norm.replace(/^gh\s+/, "")) ??
          roomIdByKey.get(`gh ${norm}`);
        if (typeof match === "number") {
          roomIds.push(match);
        }
      });

      console.log("[assignRoomsToShiftBlock] matched rooms", {
        matchedCount: roomIds.length,
        roomIds,
        totalRooms: allRooms.length,
      });

      if (roomIds.length === 0) {
        throw new Error(
          `ROOMS_NOT_FOUND:${uniqueRoomNames.join(",") || "unknown"}`
        );
      }

      // Remove the selected rooms from any profile assignments within this block
      await tx
        .delete(shiftBlockProfileRoom)
        .where(
          and(
            eq(shiftBlockProfileRoom.shiftBlock, shiftBlockId),
            inArray(shiftBlockProfileRoom.room, roomIds)
          )
        );

      // If a target profile is provided, add junction rows for it
      if (targetProfileId) {
        const rows: ShiftBlockProfileRoom[] = roomIds.map((roomId) => ({
          createdAt: new Date().toISOString(),
          profile: targetProfileId,
          room: roomId,
          shiftBlock: shiftBlockId,
        })) as any;

        if (rows.length > 0) {
          await tx
            .insert(shiftBlockProfileRoom)
            .values(rows)
            .onConflictDoNothing();
        }
      }

      // Update actions assigned_to for actions in these rooms within the block window
      if (
        blockMeta?.date &&
        blockMeta.startTime &&
        blockMeta.endTime &&
        roomIds.length > 0 &&
        targetProfileId !== undefined // allow null to unassign
      ) {
        const eventsForRooms = await tx
          .select({ id: events.id, roomName: events.roomName })
          .from(events)
          .where(
            and(
              eq(events.date, blockMeta.date),
              inArray(events.roomName, candidateList)
            )
          );

        const eventIds = eventsForRooms
          .map((e) => e.id)
          .filter((id): id is number => typeof id === "number");

        if (eventIds.length > 0) {
          const updateResult = await tx
            .update(actions)
            .set({ assignedTo: targetProfileId })
            .where(
              and(
                inArray(actions.event, eventIds),
                gte(actions.startTime, blockMeta.startTime),
                lt(actions.startTime, blockMeta.endTime)
              )
            )
            .returning({ id: actions.id });

          console.log("[assignRoomsToShiftBlock] updated actions", {
            count: updateResult.length,
            actionIds: updateResult.map((r) => r.id),
          });
        }
      }

      const updated = await tx.query.shiftBlocks.findFirst({
        where: eq(shiftBlocks.id, shiftBlockId),
        with: {
          shiftBlockProfileRooms: { with: { profile: true, venue: true } },
          shiftBlockProfiles: { with: { profile: true } },
        },
      });

      console.log("[assignRoomsToShiftBlock] success", {
        shiftBlockId,
        assignedRooms: roomIds.length,
        targetProfileId,
      });

      if (!updated) return null;

      return toAssignments(
        updated,
        updated.shiftBlockProfileRooms ?? [],
        updated.shiftBlockProfiles ?? []
      );
    });

    if (blockDateForCache) {
      try {
        await revalidateTag(`calendar:${blockDateForCache}`);
      } catch (revalidateError) {
        console.error("[assignRoomsToShiftBlock] revalidateTag failed", {
          blockDateForCache,
          error: revalidateError,
        });
      }
    }
    return updatedBlock;
  } catch (error) {
    console.error("[db] assignments.assignRoomsToShiftBlock", {
      shiftBlockId,
      roomNames,
      targetProfileId,
      error,
    });
    throw error;
  }
}

function buildRoomNameCandidates(roomNames: string[]): string[] {
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
}

async function copyShiftBlocksWithRelations(
  tx: typeof db,
  sourceDate: string,
  targetDate: string
): Promise<{
  blocks: ShiftBlockRow[];
  roomRelations: ShiftBlockRoomRelationForCopy[];
}> {
  const sourceBlocks = await tx.query.shiftBlocks.findMany({
    where: eq(shiftBlocks.date, sourceDate),
    orderBy: asc(shiftBlocks.startTime),
    with: {
      shiftBlockProfileRooms: { with: { venue: true } },
      shiftBlockProfiles: true,
    },
  });

  await tx.delete(shiftBlocks).where(eq(shiftBlocks.date, targetDate));

  if (sourceBlocks.length === 0) {
    return { blocks: [], roomRelations: [] };
  }

  const blocksToInsert = sourceBlocks.map(
    ({
      id: _id,
      createdAt: _createdAt,
      shiftBlockProfileRooms: _rel,
      shiftBlockProfiles: _profiles,
      assignments: _assign,
      ...rest
    }) => ({
      ...rest,
      date: targetDate,
      assignments: null,
    })
  );

  const inserted = await tx.insert(shiftBlocks).values(blocksToInsert).returning();

  const profileRows: ShiftBlockProfile[] = [];
  const roomRelations: ShiftBlockRoomRelationForCopy[] = [];
  const timestamp = new Date().toISOString();

  sourceBlocks.forEach((sourceBlock, idx) => {
    const newBlockId = inserted[idx]?.id;
    if (!newBlockId) return;

    (sourceBlock.shiftBlockProfiles ?? []).forEach((rel) => {
      if (!rel?.profile) return;
      profileRows.push({
        createdAt: timestamp,
        profile: rel.profile,
        shiftBlock: newBlockId,
      } as any);
    });

    (sourceBlock.shiftBlockProfileRooms ?? []).forEach((rel) => {
      const profileId = rel?.profile;
      const roomId = rel?.room;
      if (!profileId || !roomId) return;
      roomRelations.push({
        shiftBlock: newBlockId,
        profile: profileId as any,
        room: roomId,
        roomName: (rel as any)?.venue?.name ?? (rel as any)?.roomName ?? null,
      });
    });
  });

  if (profileRows.length > 0) {
    await tx.insert(shiftBlockProfile).values(profileRows).onConflictDoNothing();
  }

  if (roomRelations.length > 0) {
    await tx
      .insert(shiftBlockProfileRoom)
      .values(
        roomRelations.map((rel) => ({
          createdAt: timestamp,
          profile: rel.profile,
          room: rel.room,
          shiftBlock: rel.shiftBlock,
        })) as any
      )
      .onConflictDoNothing();
  }

  return { blocks: inserted, roomRelations };
}

async function updateActionsForCopiedBlocks(
  tx: typeof db,
  blocks: ShiftBlockRow[],
  roomRelations: ShiftBlockRoomRelationForCopy[]
) {
  if (blocks.length === 0) return;

  const roomIdToName = new Map<number, string | null>();
  roomRelations.forEach((rel) => {
    if (rel.roomName) {
      roomIdToName.set(rel.room, rel.roomName);
    }
  });

  const missingRoomIds = Array.from(
    new Set(
      roomRelations
        .map((rel) => rel.room)
        .filter((roomId) => !roomIdToName.has(roomId))
    )
  );

  if (missingRoomIds.length > 0) {
    const venueRows = await tx
      .select({ id: venues.id, name: venues.name })
      .from(venues)
      .where(inArray(venues.id, missingRoomIds));
    venueRows.forEach((venue) => {
      roomIdToName.set(venue.id, venue.name ?? null);
    });
  }

  const relationsByBlock = new Map<number, Map<string, string[]>>();
  roomRelations.forEach((rel) => {
    const roomName = roomIdToName.get(rel.room);
    if (!roomName) return;
    const blockMap = relationsByBlock.get(rel.shiftBlock) ?? new Map();
    const rooms = blockMap.get(rel.profile) ?? [];
    rooms.push(roomName);
    blockMap.set(rel.profile, rooms);
    relationsByBlock.set(rel.shiftBlock, blockMap);
  });

  for (const block of blocks) {
    if (!block.id || !block.date || !block.startTime || !block.endTime) continue;
    const profileRooms = relationsByBlock.get(block.id);
    if (!profileRooms) continue;

    for (const [profileId, roomNames] of profileRooms.entries()) {
      const candidateList = buildRoomNameCandidates(roomNames);
      if (candidateList.length === 0) continue;

      const eventsForRooms = await tx
        .select({ id: events.id })
        .from(events)
        .where(and(eq(events.date, block.date), inArray(events.roomName, candidateList)));

      const eventIds = eventsForRooms
        .map((e) => e.id)
        .filter((id): id is number => typeof id === "number");

      if (eventIds.length === 0) continue;

      await tx
        .update(actions)
        .set({ assignedTo: profileId })
        .where(
          and(
            inArray(actions.event, eventIds),
            gte(actions.startTime, block.startTime),
            lt(actions.startTime, block.endTime)
          )
        );
    }
  }
}

/**
 * Replace all shift blocks for a date with a new set (delete + insert)
 */
export async function replaceShiftBlocksForDate(
  date: string,
  newBlocks: ShiftBlockInput[]
): Promise<ShiftBlockWithAssignments[]> {
  try {
    return await db.transaction(async (tx) => {
      await tx.delete(shiftBlocks).where(eq(shiftBlocks.date, date));

      if (newBlocks.length === 0) return [];

      const prepared = newBlocks.map((block) => ({
        date: block.date,
        startTime: block.startTime,
        endTime: block.endTime,
        assignments: null, // assignments now live in junction table
      }));

      const inserted = await tx
        .insert(shiftBlocks)
        .values(prepared)
        .returning();

      // map rooms by name for quick lookup
      const allRooms = await tx.select().from(venues);
      const roomByName = new Map<string, number>();
      allRooms.forEach((room) => {
        if (room.name) roomByName.set(room.name, room.id);
      });

      const junctionRows: ShiftBlockProfileRoom[] = [];
      const profileRows: ShiftBlockProfile[] = [];

      newBlocks.forEach((block, index) => {
        const blockId = inserted[index]?.id;
        if (!blockId) return;
        const assignments = Array.isArray(block.assignments)
          ? block.assignments
          : [];

        assignments.forEach((assignment: any) => {
          const profileId =
            typeof assignment?.user === "string" ? assignment.user : null;
          if (!profileId) return;
          const roomNames = Array.isArray(assignment?.rooms)
            ? assignment.rooms
            : [];
          profileRows.push({
            createdAt: new Date().toISOString(),
            profile: profileId,
            shiftBlock: blockId,
          } as any);
          roomNames.forEach((roomName: any) => {
            if (typeof roomName !== "string") return;
            const roomId = roomByName.get(roomName);
            if (!roomId) {
              console.warn(
                "[db] assignments.replaceShiftBlocksForDate missing room",
                roomName
              );
              return;
            }
            junctionRows.push({
              createdAt: new Date().toISOString(),
              profile: profileId,
              room: roomId,
              shiftBlock: blockId,
              roomName,
              profileName: assignment?.name ?? null,
            } as any);
          });
        });
      });

      if (junctionRows.length > 0) {
        await tx.insert(shiftBlockProfileRoom).values(junctionRows);
      }
      if (profileRows.length > 0) {
        await tx
          .insert(shiftBlockProfile)
          .values(profileRows)
          .onConflictDoNothing();
      }

      return inserted.map((block) =>
        toAssignments(
          block,
          junctionRows.filter((jr) => jr.shiftBlock === block.id),
          profileRows.filter((pr) => pr.shiftBlock === block.id)
        )
      );
    });
  } catch (error) {
    console.error("[db] assignments.replaceShiftBlocksForDate", {
      date,
      error,
    });
    throw error;
  }
}

export async function deleteShiftBlocksForDate(date: string) {
  try {
    await db.delete(shiftBlocks).where(eq(shiftBlocks.date, date));
  } catch (error) {
    console.error("[db] assignments.deleteShiftBlocksForDate", { date, error });
    throw error;
  }
}

export async function copyShiftBlocksForDate(
  sourceDate: string,
  targetDate: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const { blocks, roomRelations } = await copyShiftBlocksWithRelations(
        tx,
        sourceDate,
        targetDate
      );
      await updateActionsForCopiedBlocks(tx, blocks, roomRelations);
    });
  } catch (error) {
    console.error("[db] assignments.copyShiftBlocksForDate", {
      sourceDate,
      targetDate,
      error,
    });
    throw error;
  }
}

/**
 * Get all user profiles (for technicians list)
 */
export async function getProfiles(): Promise<ProfileRow[]> {
  // "use cache";
  // cacheTag("profiles");
  try {
    const result = await db.select().from(profiles);
    return result;
  } catch (error) {
    console.error("[db] assignments.getProfiles", { error });
    throw error;
  }
}

/**
 * Get all rooms (for assignments)
 */
export async function getRooms(): Promise<RoomRow[]> {
  try {
    const result = await db.select().from(venues).orderBy(asc(venues.name));
    return result;
  } catch (error) {
    console.error("[db] assignments.getRooms", { error });
    throw error;
  }
}

/**
 * Get shifts for multiple dates
 */
export async function getShiftsForDates(
  dates: string[]
): Promise<ShiftRow[]> {
  try {
    if (dates.length === 0) return [];
    const result = await db
      .select()
      .from(shifts)
      .where(inArray(shifts.date, dates));
    return result;
  } catch (error) {
    console.error("[db] assignments.getShiftsForDates", { dates, error });
    throw error;
  }
}

export async function deleteShiftsForDate(date: string) {
  try {
    await db.delete(shifts).where(eq(shifts.date, date));
  } catch (error) {
    console.error("[db] assignments.deleteShiftsForDate", { date, error });
    throw error;
  }
}

export async function copyShiftsForDate(
  sourceDate: string,
  targetDate: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Copy shifts
      const sourceShifts = await tx
        .select()
        .from(shifts)
        .where(eq(shifts.date, sourceDate));

      if (sourceShifts.length === 0) {
        await tx.delete(shifts).where(eq(shifts.date, targetDate));
        return;
      }

      const shiftsToInsert = sourceShifts.map(
        ({ id: _id, createdAt: _createdAt, ...rest }) => ({
          ...rest,
          date: targetDate,
        })
      );

      await tx.delete(shifts).where(eq(shifts.date, targetDate));
      await tx.insert(shifts).values(shiftsToInsert);

      // Copy shift blocks (with junction tables) and update action assignments
      const { blocks, roomRelations } = await copyShiftBlocksWithRelations(
        tx,
        sourceDate,
        targetDate
      );
      await updateActionsForCopiedBlocks(tx, blocks, roomRelations);
    });
  } catch (error) {
    console.error("[db] assignments.copyShiftsForDate", {
      sourceDate,
      targetDate,
      error,
    });
    throw error;
  }
}

export async function upsertShiftForProfileDate(
  input: ShiftUpsertInput
): Promise<ShiftRow[]> {
  const { profileId, date, startTime, endTime } = input;
  try {
    return await db.transaction(async (tx) => {
      await tx
        .delete(shifts)
        .where(eq(shifts.date, date))
        .where(eq(shifts.profileId, profileId));

      if (!startTime || !endTime) {
        return [];
      }

      const inserted = await tx
        .insert(shifts)
        .values({
          profileId,
          date,
          startTime,
          endTime,
        })
        .returning();

      return inserted;
    });
  } catch (error) {
    console.error("[db] assignments.upsertShiftForProfileDate", {
      input,
      error,
    });
    throw error;
  }
}

/**
 * Rebuild shift blocks for a date based on existing shifts (assignments will
 * contain users with empty room arrays; room assignments can be added later).
 */
export async function rebuildShiftBlocksForDate(
  date: string
): Promise<ShiftBlockWithAssignments[]> {
  try {
    return await db.transaction(async (tx) => {
      // Fetch shifts for the date
      const dateShifts = await tx
        .select()
        .from(shifts)
        .where(eq(shifts.date, date));

      // Build a map of profileId -> name for all involved profiles
      const profileIds = Array.from(
        new Set(
          dateShifts
            .map((s) => s.profileId)
            .filter((id): id is string => Boolean(id))
        )
      );
      const profileNameMap = new Map<string, string | null>();
      if (profileIds.length > 0) {
        const profileRows = await tx
          .select({ id: profiles.id, name: profiles.name })
          .from(profiles)
          .where(inArray(profiles.id, profileIds));
        profileRows.forEach((p) => {
          profileNameMap.set(p.id, p.name ?? null);
        });
      }

      // Delete existing blocks (cascade removes junction rows)
      await tx.delete(shiftBlocks).where(eq(shiftBlocks.date, date));

      if (dateShifts.length === 0) return [];

      // Build time points
      const timePoints = new Set<string>();
      const validShifts = dateShifts.filter(
        (s) => s.startTime && s.endTime && s.startTime !== s.endTime
      );
      validShifts.forEach((s) => {
        timePoints.add(s.startTime!);
        timePoints.add(s.endTime!);
      });

      const sortedTimes = Array.from(timePoints).sort();
      const blocksToInsert: Array<{
        date: string;
        startTime: string;
        endTime: string;
        assignments: ShiftBlockAssignment[];
      }> = [];

      for (let i = 0; i < sortedTimes.length - 1; i++) {
        const start = sortedTimes[i];
        const end = sortedTimes[i + 1];
        if (!start || !end || start === end) continue;

        const overlappingUsers = validShifts
          .filter(
            (s) => (s.startTime ?? "") < end && (s.endTime ?? "") > start
          )
          .map((s) => s.profileId)
          .filter((id): id is string => Boolean(id));

        if (overlappingUsers.length === 0) continue;

        const assignments = Array.from(new Set(overlappingUsers)).map(
          (userId) => {
            const derivedName = profileNameMap.get(userId) ?? null;
            return {
              user: userId,
              name: derivedName,
              rooms: [],
            } as ShiftBlockAssignment;
          }
        );

        blocksToInsert.push({
          date,
          startTime: start,
          endTime: end,
          assignments,
        });
      }

      if (blocksToInsert.length === 0) return [];

      const inserted = await tx
        .insert(shiftBlocks)
        .values(
          blocksToInsert.map((b) => ({
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            assignments: null,
          }))
        )
        .returning();

      const profileRows: ShiftBlockProfile[] = [];
      inserted.forEach((block, idx) => {
        const assignments = blocksToInsert[idx]?.assignments ?? [];
        assignments.forEach((assignment) => {
          const userId = assignment.user;
          profileRows.push({
            createdAt: new Date().toISOString(),
            profile: userId,
            shiftBlock: block.id,
          } as any);
        });
      });

      if (profileRows.length > 0) {
        await tx
          .insert(shiftBlockProfile)
          .values(profileRows)
          .onConflictDoNothing();
      }

      return inserted.map((block, idx) =>
        toAssignments(
          block,
          [], // no room relations created here
          profileRows.filter((pr) => pr.shiftBlock === block.id)
        )
      );
    });
  } catch (error) {
    console.error("[db] assignments.rebuildShiftBlocksForDate", { date, error });
    throw error;
  }
}

/**
 * Copy both shifts and shift blocks from a previous week into the provided target week dates
 */
export async function copyScheduleFromPreviousWeek(
  weekDates: string[],
  previousWeekStartDate: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // Clear existing data for target week
      for (const targetDate of weekDates) {
        await tx.delete(shifts).where(eq(shifts.date, targetDate));
        await tx.delete(shiftBlocks).where(eq(shiftBlocks.date, targetDate));
      }

      // Copy per day
      for (let index = 0; index < weekDates.length; index++) {
        const targetDate = weekDates[index];
        const sourceDate = new Date(previousWeekStartDate);
        sourceDate.setDate(sourceDate.getDate() + index);
        const sourceDateString = sourceDate.toISOString().split("T")[0];

        // Shift blocks with junction rows + action assignments
        const { blocks, roomRelations } = await copyShiftBlocksWithRelations(
          tx,
          sourceDateString,
          targetDate
        );
        await updateActionsForCopiedBlocks(tx, blocks, roomRelations);

        // Shifts
        const sourceShifts = await tx
          .select()
          .from(shifts)
          .where(eq(shifts.date, sourceDateString));

        if (sourceShifts.length > 0) {
          const shiftsToInsert = sourceShifts.map(
            ({ id: _id, createdAt: _createdAt, ...rest }) => ({
              ...rest,
              date: targetDate,
            })
          );
          await tx.insert(shifts).values(shiftsToInsert);
        }
      }
    });
  } catch (error) {
    console.error("[db] assignments.copyScheduleFromPreviousWeek", {
      weekDates,
      previousWeekStartDate,
      error,
    });
    throw error;
  }
}
