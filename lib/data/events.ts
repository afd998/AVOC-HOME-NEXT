import { events } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export async function getFilteredEvents(date: string, currentFilter: string) {
  const eventsData = await getEvents(date);
  // Add filtering logic here
  return eventsData;
}

export async function getEvents(date: string) {
  return await db.query.events.findMany({
    where: eq(events.date, date),
  });
}
