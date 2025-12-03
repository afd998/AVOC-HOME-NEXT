import { asc, db, rooms, type Room } from "shared";

export type VenueRow = Pick<Room, "id" | "name" | "type" | "subType" | "spelling">;

export async function getVenues(): Promise<VenueRow[]> {
  try {
    const result = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        spelling: rooms.spelling,
        type: rooms.type,
        subType: rooms.subType,
      })
      .from(rooms)
      .orderBy(asc(rooms.name));

    return result;
  } catch (error) {
    console.error("[db] venues.getVenues", { error });
    throw error;
  }
}
