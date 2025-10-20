'use server'
import { unstable_cache } from "next/cache";
import { roomFilters } from "@/drizzle/schema";
import { db } from "../db";
import { InferSelectModel } from "drizzle-orm";
import { RoomFilter } from "@/lib/db/types";

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
