import { InferSelectModel } from "drizzle-orm";
import { events, roomFilters } from "@/drizzle/schema";

export type RoomFilter = InferSelectModel<typeof roomFilters>;
export type Event = InferSelectModel<typeof events>;