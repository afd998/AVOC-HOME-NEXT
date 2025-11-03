import { db } from "@/lib/db";
import { captureQc } from "@/lib/db/schema";
import { type CaptureQcRow } from "../../scrape";

export async function saveCaptureQc(captureQcRows: CaptureQcRow[]) {
  db.insert(captureQc).values(captureQcRows);
}
