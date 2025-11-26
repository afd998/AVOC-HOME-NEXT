'use server'
import { unstable_cache } from "next/cache";
import { db, roomFilters, type RoomFilter } from "shared";

export const getFilters = unstable_cache(
  async () => {
    try {
      const filters = await db.query.roomFilters.findMany();
      return filters as Array<RoomFilter>;
    } catch (error) {
      console.error("[db] filters.getFilters", { error });
      throw error;
    }
  },
  ["filters"],
  { tags: ["filters"] }
);
