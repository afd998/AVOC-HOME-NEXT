import { db } from "../../../lib/db";
import { eventHybrid } from "../../../lib/db/schema";
import { type EventHybridRow } from "../../../lib/db/types";

export async function saveEventHybridRows(eventHybridRows: EventHybridRow[]) {
  await db.insert(eventHybrid).values(eventHybridRows);
}