import {
  eq,
  inArray,
  db,
  shifts,
} from "shared";

import {
  ShiftRow,
  ShiftUpsertInput,
} from "./types";
import {
  copyShiftBlocksWithRelations,
  updateActionsForCopiedBlocks,
} from "./shift-blocks";

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

      await tx.delete(shifts).where(eq(shifts.date, targetDate));
      if (sourceShifts.length > 0) {
        const shiftsToInsert = sourceShifts.map(
          ({ id: _id, createdAt: _createdAt, ...rest }) => ({
            ...rest,
            date: targetDate,
          })
        );

        await tx.insert(shifts).values(shiftsToInsert);
      }

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
