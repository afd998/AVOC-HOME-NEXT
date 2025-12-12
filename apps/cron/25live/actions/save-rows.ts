import { eq, and, not, inArray } from "drizzle-orm";
import { db, actions, events, type ActionRow } from "shared";

export async function saveActions(
  actionRows: ActionRow[],
  scrapeDate: string,
  eventIdsToClean: Array<number | null | undefined> = []
) {
  if (actionRows.length === 0) {
    return;
  }

  // Insert new actions, ignore conflicts (preserves user modifications: status, assignedTo, completedBy)
  await db.insert(actions).values(actionRows).onConflictDoNothing();

  // Delete orphaned 25Live actions only for events we are actively processing (not started)
  const currentActionIds = actionRows
    .map((a) => a.id)
    .filter((id): id is number => id !== null && id !== undefined);

  const targetEventIds = eventIdsToClean
    .filter((id): id is number => typeof id === "number")
    .map((id) => id);

  if (targetEventIds.length === 0) {
    return;
  }

  // Restrict cleanup to events on this scrape date (safety guard)
  const eventIdsForDate = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.date, scrapeDate), inArray(events.id, targetEventIds)));

  const eventIds = eventIdsForDate
    .map((e) => e.id)
    .filter((id): id is number => typeof id === "number");

  if (eventIds.length === 0) {
    return;
  }

  const predicates = [
    inArray(actions.event, eventIds),
    eq(actions.source, "25Live"),
  ];

  if (currentActionIds.length > 0) {
    predicates.push(not(inArray(actions.id, currentActionIds)));
  }

  await db.delete(actions).where(and(...predicates));
}

