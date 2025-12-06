import { eq, inArray, db, faculty, seriesFaculty, events as eventsTable, type InferSelectModel } from "shared";
import { EventWithFirstSession } from "./hydrate-first-session";
export type FacultyMember = InferSelectModel<typeof faculty>;

export type EventWithFaculty = EventWithFirstSession & {
  faculty: FacultyMember[];
};

export async function hydrateEventsWithFaculty(
  events: EventWithFirstSession[]
): Promise<EventWithFaculty[]> {
  const facultyBySeriesId = new Map<number, FacultyMember[]>();
  const seriesIds = [...new Set(
    events
      .map((event) => event.series)
      .filter((id): id is number => id != null)
  )];

  // Get faculty for series (faculty is now linked to series, not events)
  if (seriesIds.length > 0) {
    try {
      const facultyRows = await db
        .select({
          seriesId: seriesFaculty.series,
          facultyMember: faculty,
        })
        .from(seriesFaculty)
        .innerJoin(faculty, eq(seriesFaculty.faculty, faculty.id))
        .where(inArray(seriesFaculty.series, seriesIds));

      facultyRows.forEach(({ seriesId, facultyMember }) => {
        const existing = facultyBySeriesId.get(seriesId);
        if (existing) {
          existing.push(facultyMember);
          return;
        }
        facultyBySeriesId.set(seriesId, [facultyMember]);
      });
    } catch (error) {
      console.error("[db] hydrateEventsWithFaculty", { seriesIds, error });
      throw error;
    }
  }

  // Hydrate events with faculty (lookup by series ID)
  return events.map((event) => ({
    ...event,
    faculty: event.series != null ? (facultyBySeriesId.get(event.series) ?? []) : [],
  }));
}
