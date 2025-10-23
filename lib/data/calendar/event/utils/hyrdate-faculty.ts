import { faculty, facultyEvents } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { EventWithFirstSession } from "./hydrate-first-session";
export type FacultyMember = InferSelectModel<typeof faculty>;

export type EventWithFaculty = EventWithFirstSession & {
  faculty: FacultyMember[];
};

export async function hydrateEventsWithFaculty(
  events: EventWithFirstSession[]
): Promise<EventWithFaculty[]> {
  const facultyByEventId = new Map<number, FacultyMember[]>();
  const eventIds = events.map((event) => event.id);

  // Get faculty for events
  if (eventIds.length > 0) {
    try {
      const facultyRows = await db
        .select({
          eventId: facultyEvents.event,
          facultyMember: faculty,
        })
        .from(facultyEvents)
        .innerJoin(faculty, eq(facultyEvents.faculty, faculty.id))
        .where(inArray(facultyEvents.event, eventIds));

      facultyRows.forEach(({ eventId, facultyMember }) => {
        const existing = facultyByEventId.get(eventId);
        if (existing) {
          existing.push(facultyMember);
          return;
        }
        facultyByEventId.set(eventId, [facultyMember]);
      });
    } catch (error) {
      console.error("[db] hydrateEventsWithFaculty", { eventIds, error });
      throw error;
    }
  }

  // Hydrate events with faculty
  return events.map((event) => ({
    ...event,
    faculty: facultyByEventId.get(event.id) ?? [],
  }));
}
