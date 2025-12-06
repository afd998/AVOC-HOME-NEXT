import { inArray } from "drizzle-orm";
import { db, seriesFaculty, type SeriesFacultyRow, type SeriesRow } from "shared";

/**
 * Saves series-faculty relationships to the database.
 * Deletes existing rows for the given series, then inserts new ones.
 */
export async function saveSeriesFaculty(
  seriesFacultyRows: SeriesFacultyRow[],
  seriesRows: SeriesRow[]
): Promise<void> {
  const seriesIds = seriesRows
    .map((s) => s.id)
    .filter((id): id is number => id != null);

  // Delete existing series-faculty rows for these series
  if (seriesIds.length > 0) {
    await db
      .delete(seriesFaculty)
      .where(inArray(seriesFaculty.series, seriesIds));
  }

  // Insert new series-faculty rows
  if (seriesFacultyRows.length > 0) {
    await db.insert(seriesFaculty).values(seriesFacultyRows);
  }
}

