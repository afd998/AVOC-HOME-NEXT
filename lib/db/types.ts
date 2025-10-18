import { InferSelectModel } from "drizzle-orm";
import { events, roomFilters, shiftBlocks } from "@/drizzle/schema";

export type RoomFilter = InferSelectModel<typeof roomFilters>;
export type Event = InferSelectModel<typeof events>;
export type ShiftBlock = InferSelectModel<typeof shiftBlocks>;
