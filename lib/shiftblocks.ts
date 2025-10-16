import { eq } from "drizzle-orm";
import { db } from "./db";
import { shiftBlocks } from "@/drizzle/schema"; 
export async function getShiftBlocks(date: Date) {
    const shiftBlocks = await db.query.shiftBlocks.findMany({
        where: eq(shiftBlocks.date, date),
    });
    return shiftBlocks;
}