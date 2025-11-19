import { db } from "../../../lib/db";
import { eventAvConfig } from "../../../lib/db/schema";
import { type EventAVConfigRow } from "../../../lib/db/types";

export async function saveEventAVConfigRows(eventAVConfigRows: EventAVConfigRow[]) {
  await db.insert(eventAvConfig).values(eventAVConfigRows);
}