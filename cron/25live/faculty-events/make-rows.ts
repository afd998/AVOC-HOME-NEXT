import { inArray } from "drizzle-orm";
import { db } from "../../../lib/db";
import { facultyEvents, faculty } from "../../../lib/db/schema";
import { type ProcessedEvent } from "../../../lib/db/types";
import { type InferInsertModel } from "drizzle-orm";

type FacultyEventRow = InferInsertModel<typeof facultyEvents>;
export async function makeFacultyEventsRows( 
  processedEvents: ProcessedEvent[]
): Promise<FacultyEventRow[]> {
  const processedEventIds = processedEvents
    .map((event) => event.id)
    .filter((id): id is number => typeof id === "number");

  const instructorNameSet = new Set<string>();
  processedEvents.forEach((event) => {
    if (!Array.isArray(event.instructorNames)) {
      return;
    }

    event.instructorNames.forEach((name) => {
      if (typeof name !== "string") {
        return;
      }

      const trimmedName = name.trim();
      if (trimmedName.length > 0) {
        instructorNameSet.add(trimmedName);
      }
    });
  });

  const instructorNames = Array.from(instructorNameSet);
  const facultyByName = new Map<string, number>();

  if (instructorNames.length > 0) {
    const facultyMatches = await db
      .select({
        id: faculty.id,
        name: faculty.twentyfiveliveName,
      })
      .from(faculty)
      .where(inArray(faculty.twentyfiveliveName, instructorNames));

    facultyMatches.forEach(({ id, name }) => {
      if (name) {
        facultyByName.set(name.trim(), id);
      }
    });
  }

  const facultyEventRows: Array<{ event: number; faculty: number }> = [];
  const seenPairs = new Set<string>();

  processedEvents.forEach((event) => {
    if (typeof event.id !== "number" || !Array.isArray(event.instructorNames)) {
      return;
    }

    event.instructorNames.forEach((name) => {
      if (typeof name !== "string") {
        return;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        return;
      }

      const facultyId = facultyByName.get(trimmedName);
      if (!facultyId) {
        return;
      }

      const pairKey = `${event.id}-${facultyId}`;
      if (seenPairs.has(pairKey)) {
        return;
      }

      seenPairs.add(pairKey);
      facultyEventRows.push({
        event: event.id as number,
        faculty: facultyId,
      });
    });
  });

  return facultyEventRows;
}
