import { db } from "../../../lib/db";
import { eventRecording } from "../../../lib/db/schema";
import { type EventRecordingRow } from "../../../lib/db/types";
export function saveEventRecordingRows(eventRecordingRows: EventRecordingRow[]): void {
  eventRecordingRows.forEach((eventRecordingRow) => {
    db.insert(eventRecording).values(eventRecordingRow).onConflictDoNothing();
  });
}