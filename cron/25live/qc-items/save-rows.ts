import { db } from "@/lib/db";
import { qcItems } from "@/lib/db/schema";
import { type QcItemRow } from "../../../lib/db/types";

export async function saveQcItemRows(qcItemsRows: QcItemRow[]) {
  if (qcItemsRows.length === 0) {
    return;
  }

  await db.insert(qcItems).values(qcItemsRows).onConflictDoNothing();
}
