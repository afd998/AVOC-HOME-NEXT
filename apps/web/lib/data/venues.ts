import { asc, db, eq, venues, type Room } from "shared";

export type VenueRow = Pick<
  Room,
  "id" | "name" | "type" | "subType" | "spelling" | "building"
>;

export async function getVenueById(
  venueId: string | number
): Promise<VenueRow | null> {
  const numericId =
    typeof venueId === "string" ? Number.parseInt(venueId, 10) : venueId;

  if (!Number.isFinite(numericId)) {
    return null;
  }

  try {
    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, numericId),
      columns: {
        id: true,
        name: true,
        spelling: true,
        type: true,
        subType: true,
        building: true,
      },
    });

    return venue ?? null;
  } catch (error) {
    console.error("[db] venues.getVenueById", { venueId, error });
    throw error;
  }
}

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
