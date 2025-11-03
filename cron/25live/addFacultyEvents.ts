import { inArray } from "drizzle-orm";
import { db } from "../../lib/db";
import { facultyEvents, faculty } from "../../lib/db/schema";
import { type ProcessedEvent } from "./transformRawEventsToEvents/transformRawEventsToEvents";
import { EventGraph } from "./scrape";

export async function addFacultyEvents(eventGraph: EventGraph[]): EventGraph[] {
  const processedEvents = eventGraph.map((event) => event.events).flat();
  const processedEventIds = eventGraph.events
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

  console.log(`👨‍🏫 Found ${instructorNames.length} unique instructor names`);

  if (instructorNames.length > 0) {
    const facultyMatches = await db
      .select({
        id: faculty.id,
        name: faculty.twentyfiveliveName,
      })
      .from(faculty)
      .where(inArray(faculty.twentyfiveliveName, instructorNames));

    console.log(
      `🔍 Matched ${facultyMatches.length} instructors in faculty database`
    );

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

  console.log(
    `🔗 Created ${facultyEventRows.length} faculty-event relationships`
  );

  if (processedEventIds.length > 0) {
    console.log(`🧹 Cleaning up existing faculty-event relationships...`);
    await db
      .delete(facultyEvents)
      .where(inArray(facultyEvents.event, processedEventIds));
    console.log(`🗑️  Deleted existing faculty-event relationships`);
  }

  if (facultyEventRows.length > 0) {
    console.log(
      `👥 Inserting ${facultyEventRows.length} faculty-event relationships...`
    );
    await db.insert(facultyEvents).values(facultyEventRows);
    console.log(`✅ Successfully inserted faculty-event relationships`);
  }
}
