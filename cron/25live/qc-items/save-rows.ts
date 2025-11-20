import { db } from "@/lib/db";
import { qcItems } from "@/lib/db/schema";
import { type QcItemRow } from "../../../lib/db/types";
import { eq, and, or, inArray } from "drizzle-orm";

export async function saveQcItemRows(qcItemsRows: QcItemRow[]) {
  if (qcItemsRows.length === 0) {
    return;
  }

  // Insert new QC items, ignore conflicts (preserves all user modifications)
  await db.insert(qcItems).values(qcItemsRows).onConflictDoNothing();

  // Delete orphaned QC items whose actions are in this scrape but the item isn't
  const actionIds = [
    ...new Set(
      qcItemsRows
        .map((r) => r.action)
        .filter((id): id is number => id !== null && id !== undefined)
    ),
  ];

  if (actionIds.length === 0) {
    return;
  }

  // Get valid (action, qcItemDict) combinations
  const validCombos = qcItemsRows.map((r) => ({
    action: r.action,
    dict: r.qcItemDict,
  }));

  // Fetch existing QC items for these actions
  const existing = await db
    .select()
    .from(qcItems)
    .where(inArray(qcItems.action, actionIds));

  // Find items to delete (exists in DB but not in scrape)
  const toDelete = existing.filter(
    (e) =>
      !validCombos.some((v) => v.action === e.action && v.dict === e.qcItemDict)
  );

  // Delete orphaned items
  if (toDelete.length > 0) {
    await db.delete(qcItems).where(
      or(
        ...toDelete.map((item) =>
          and(
            eq(qcItems.action, item.action),
            eq(qcItems.qcItemDict, item.qcItemDict)
          )
        )
      )
    );
  }
}
