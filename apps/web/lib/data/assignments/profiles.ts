import { db, profiles, asc } from "shared";
import type { ProfileRow } from "./types";

/**
 * Get all user profiles (for technicians list)
 */
export async function getProfiles(): Promise<ProfileRow[]> {
  // "use cache";
  // cacheTag("profiles");
  try {
    const result = await db.select().from(profiles).orderBy(asc(profiles.name));
    return result;
  } catch (error) {
    console.error("[db] assignments.getProfiles", { error });
    throw error;
  }
}
