import { inArray } from "drizzle-orm";
import { db, faculty, type SeriesFacultyRow, type SeriesRow } from "shared";
import type { RawEvent } from "../schemas";
import { getInstructorNames } from "../events/index";

/**
 * Creates series-faculty rows from raw series data.
 * Instructor names are a property of a series, not individual events.
 */
export async function makeSeriesFacultyRows(
  rawData: RawEvent[],
  seriesRows: SeriesRow[]
): Promise<SeriesFacultyRow[]> {
  const allowedSeriesIds = new Set(
    (Array.isArray(seriesRows) ? seriesRows : [])
      .map((series) => series.id)
      .filter((id): id is number => typeof id === "number")
  );

  if (allowedSeriesIds.size === 0) {
    return [];
  }

  const allowedSeriesData = rawData.filter((series) =>
    allowedSeriesIds.has(series.itemId)
  );

  // Collect all unique instructor names across all series
  const instructorNameSet = new Set<string>();
  
  allowedSeriesData.forEach((series) => {
    const instructorNames = getInstructorNames(series);
    if (!Array.isArray(instructorNames)) {
      return;
    }

    instructorNames.forEach((name) => {
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

  // Look up faculty IDs by their 25Live names
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

  // Create series-faculty rows
  const seriesFacultyRows: SeriesFacultyRow[] = [];
  const seenPairs = new Set<string>();

  allowedSeriesData.forEach((series) => {
    const seriesId = series.itemId;
    const instructorNames = getInstructorNames(series);
    
    if (!Array.isArray(instructorNames)) {
      return;
    }

    instructorNames.forEach((name) => {
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

      // Dedupe by series-faculty pair
      const pairKey = `${seriesId}-${facultyId}`;
      if (seenPairs.has(pairKey)) {
        return;
      }

      seenPairs.add(pairKey);
      seriesFacultyRows.push({
        series: seriesId,
        faculty: facultyId,
      });
    });
  });

  return seriesFacultyRows;
}
