import { db } from "@/lib/db";
import { qcs } from "@/lib/db/schema";
import { type QcRow } from "../../scrape";

export async function saveCaptureQcRows(captureQcRows: QcRow[]) {
  if (captureQcRows.length === 0) {
    return;
  }

  await db.insert(qcs).values(captureQcRows).onConflictDoNothing();
}
