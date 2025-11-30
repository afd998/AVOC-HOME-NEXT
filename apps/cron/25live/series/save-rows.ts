import { sql, inArray } from "drizzle-orm";
import { db, series, events, type SeriesRow, type ProcessedEvent } from "shared";

/**
 * Creates placeholder series records so events can reference them via FK.
 * Called BEFORE saving events.
 */
export async function ensureSeriesExist(eventsData: ProcessedEvent[]): Promise<void> {
  // Get unique series from events
  const seriesMap = new Map<number, ProcessedEvent>();
  for (const event of eventsData) {
    if (event.itemId != null && !seriesMap.has(event.itemId)) {
      seriesMap.set(event.itemId, event);
    }
  }

  if (seriesMap.size === 0) {
    return;
  }

  // Create placeholder rows (will be updated with accurate data later)
  const placeholderRows: SeriesRow[] = [];
  for (const [itemId, event] of seriesMap.entries()) {
    placeholderRows.push({
      id: itemId,
      createdAt: new Date().toISOString(),
      seriesName: event.eventName ?? "",
      seriesType: event.eventType ?? "",
      totalEvents: 1, // Placeholder, will be updated
      firstDate: event.date ?? "",
      lastDate: event.date ?? "",
    });
  }

  // Insert only if not exists (don't update existing series yet)
  await db
    .insert(series)
    .values(placeholderRows)
    .onConflictDoNothing();
}

/**
 * Computes and updates series data based on ALL events in the database.
 * Called AFTER saving events to get accurate totals.
 */
export async function updateSeriesFromDb(seriesIds: number[]): Promise<void> {
  if (seriesIds.length === 0) {
    return;
  }

  // Query all events for these series from the database
  const seriesEvents = await db
    .select({
      itemId: events.itemId,
      eventName: events.eventName,
      eventType: events.eventType,
      date: events.date,
    })
    .from(events)
    .where(inArray(events.itemId, seriesIds));

  // Group events by series (itemId)
  const seriesMap = new Map<number, typeof seriesEvents>();
  for (const event of seriesEvents) {
    if (event.itemId == null) continue;
    
    const existing = seriesMap.get(event.itemId);
    if (existing) {
      existing.push(event);
    } else {
      seriesMap.set(event.itemId, [event]);
    }
  }

  // Build series rows from aggregated data
  const seriesRows: SeriesRow[] = [];
  for (const [itemId, groupEvents] of seriesMap.entries()) {
    // Sort by date to get first/last
    const dates = groupEvents
      .map((e) => e.date)
      .filter((d): d is string => d != null)
      .sort();

    const firstEvent = groupEvents[0];
    
    seriesRows.push({
      id: itemId,
      createdAt: new Date().toISOString(),
      seriesName: firstEvent?.eventName ?? "",
      seriesType: firstEvent?.eventType ?? "",
      totalEvents: groupEvents.length,
      firstDate: dates[0] ?? "",
      lastDate: dates[dates.length - 1] ?? "",
    });
  }

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
      itemId: events.itemId,
      date: events.date,
      startTime: events.startTime,
    })
    .from(events)
    .where(inArray(events.itemId, seriesIds));

  // Group by itemId
  const seriesMap = new Map<number, typeof seriesEvents>();
  for (const event of seriesEvents) {
    if (event.itemId == null) continue;
    
    const existing = seriesMap.get(event.itemId);
    if (existing) {
      existing.push(event);
    } else {
      seriesMap.set(event.itemId, [event]);
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
