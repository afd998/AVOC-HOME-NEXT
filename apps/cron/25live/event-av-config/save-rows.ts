import { sql } from "drizzle-orm";
import { db, eventAvConfig, type EventAVConfigRow } from "shared";

export async function saveEventAVConfigRows(
  eventAVConfigRows: EventAVConfigRow[]
) {
  if (eventAVConfigRows.length === 0) {
    return;
  }

  // Upsert AV config rows (updates all fields since no user modifications)
  // Note: Every event has an AV config row, so no deletes needed
  await db
    .insert(eventAvConfig)
    .values(eventAVConfigRows)
    .onConflictDoUpdate({
      target: eventAvConfig.event,
      set: {
        leftSource: sql`excluded.left_source`,
        rightSource: sql`excluded.right_source`,
        centerSource: sql`excluded.center_source`,
        leftDevice: sql`excluded.left_device`,
        rightDevice: sql`excluded.right_device`,
        centerDevice: sql`excluded.center_device`,
        handhelds: sql`excluded.handhelds`,
        lapels: sql`excluded.lapels`,
        clicker: sql`excluded.clicker`,
      },
    });
}