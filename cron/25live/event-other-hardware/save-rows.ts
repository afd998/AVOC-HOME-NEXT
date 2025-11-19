import { db } from "../../../lib/db";
import { eventOtherHardware } from "../../../lib/db/schema";
import { type EventOtherHardwareRow } from "../../../lib/db/types";

export async function saveEventOtherHardwareRows(
  eventOtherHardwareRows: EventOtherHardwareRow[]
) {
  await db.insert(eventOtherHardware).values(eventOtherHardwareRows);
}
