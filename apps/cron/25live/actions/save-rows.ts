import { eq, and, not, inArray } from "drizzle-orm";
import { db, actions, events, type ActionRow } from "shared";

export async function saveActions(actionRows: ActionRow[], scrapeDate: string) {
  if (actionRows.length === 0) {
    return;
  }

  // Insert new actions, ignore conflicts (preserves user modifications: status, assignedTo, completedBy)
  await db.insert(actions).values(actionRows).onConflictDoNothing();

  // Delete orphaned actions for events on this date that aren't in the current scrape
  const currentActionIds = actionRows
    .map((a) => a.id)
    .filter((id): id is number => id !== null && id !== undefined);

  if (currentActionIds.length > 0) {
    // Get event IDs for this scrape date
    const eventsForDate = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.date, scrapeDate));
    
    const eventIdsForDate = eventsForDate
      .map((e) => e.id)
      .filter((id): id is number => id !== null && id !== undefined);

    if (eventIdsForDate.length > 0) {
      // Delete actions where the event is in this date and action ID is not in current scrape
      await db
        .delete(actions)
        .where(
          and(
            inArray(actions.event, eventIdsForDate),
            not(inArray(actions.id, currentActionIds))
          )
        );
    }
  }
}


