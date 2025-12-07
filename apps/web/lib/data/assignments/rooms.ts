import { db, venues, asc } from "shared";
import type { RoomRow } from "./types";

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
