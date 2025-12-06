import { sql, inArray } from "drizzle-orm";
import { db, series, events, type SeriesRow } from "shared";

/**
 * Saves series rows to the database.
 * Uses upsert to update existing series or insert new ones.
 */
export async function saveSeries(seriesRows: SeriesRow[]): Promise<void> {
  if (seriesRows.length === 0) {
    return;
  }

  await db
    .insert(series)
    .values(seriesRows)
    .onConflictDoUpdate({
      target: series.id,
      set: {
        seriesName: sql`excluded.series_name`,
        seriesType: sql`excluded.series_type`,
        totalEvents: sql`excluded.total_events`,
        firstDate: sql`excluded.first_date`,
        lastDate: sql`excluded.last_date`,
        raw: sql`excluded.raw`,
      },
    });
}

/**
 * Computes event positions within their series based on ALL events in the database.
 * Returns a map of eventId -> position (1-based).
 */
export async function computeSeriesPositions(seriesIds: number[]): Promise<Map<number, number>> {
  if (seriesIds.length === 0) {
    return new Map();
  }

  // Query all events for these series, ordered chronologically
  const seriesEvents = await db
    .select({
      id: events.id,
      series: events.series,
      date: events.date,
      startTime: events.startTime,
    })
    .from(events)
    .where(inArray(events.series, seriesIds));

  // Group by series FK
  const seriesMap = new Map<number, typeof seriesEvents>();
  for (const event of seriesEvents) {
    if (event.series == null) continue;
    
    const existing = seriesMap.get(event.series);
    if (existing) {
      existing.push(event);
    } else {
      seriesMap.set(event.series, [event]);
    }
  }

  // Compute positions
  const positionMap = new Map<number, number>();
  for (const [, groupEvents] of seriesMap.entries()) {
    // Sort chronologically
    groupEvents.sort((a, b) => {
      const dateCompare = (a.date ?? "").localeCompare(b.date ?? "");
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    });

    // Assign 1-based positions
    groupEvents.forEach((event, index) => {
      positionMap.set(event.id, index + 1);
    });
  }

  return positionMap;
}
