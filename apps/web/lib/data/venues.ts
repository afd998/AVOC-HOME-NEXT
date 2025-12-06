import { asc, db, venues, type Room } from "shared";

export type VenueRow = Pick<
  Room,
  "id" | "name" | "type" | "subType" | "spelling" | "building"
>;

export async function getVenues(): Promise<VenueRow[]> {
  try {
    const result = await db
      .select({
        id: venues.id,
        name: venues.name,
        spelling: venues.spelling,
        type: venues.type,
        subType: venues.subType,
        building: venues.building,
      })
      .from(venues)
      .orderBy(asc(venues.name));

    return result;
  } catch (error) {
    console.error("[db] venues.getVenues", { error });
    throw error;
  }
}
