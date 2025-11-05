import { db } from "@/lib/db";
import { qcs } from "@/lib/db/schema";
import { type QcRow } from "../../scrape";

export async function saveCaptureQcRows(captureQcRows: QcRow[]) {
  await db.insert(qcs).values(captureQcRows).onConflictDoNothing();
}
