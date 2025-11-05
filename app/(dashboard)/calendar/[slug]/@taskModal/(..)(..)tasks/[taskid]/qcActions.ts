"use server";

import { db } from "@/lib/db";
import { qcItems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type QCItemInsert = InferInsertModel<typeof qcItems>;

type SaveCaptureQcItemsPayload = {
  taskId: number;
  qcItemsData: QCItemInsert[];
};

type SaveCaptureQcItemsResult =
  | { success: true }
  | { success: false; error: string };

export async function saveCaptureQcItemsAction({
  taskId,
  qcItemsData,
}: SaveCaptureQcItemsPayload): Promise<SaveCaptureQcItemsResult> {
  if (!Number.isInteger(taskId)) {
    return { success: false, error: "Invalid task id" };
  }

  if (!Array.isArray(qcItemsData)) {
    return { success: false, error: "Invalid QC items data" };
  }

  try {
    // Use upsert (onConflictDoUpdate) to handle existing QC items
    // Since we have a composite primary key (qc + qcItemDict), we can use this
    for (const qcItem of qcItemsData) {
      // Ensure qc matches taskId
      if (qcItem.qc !== taskId) {
        continue;
      }

      // Use upsert: insert or update if conflict on primary key
      await db
        .insert(qcItems)
        .values(qcItem)
        .onConflictDoUpdate({
          target: [qcItems.qc, qcItems.qcItemDict],
          set: {
            status: qcItem.status,
            waived: qcItem.waived,
            failMode: qcItem.failMode,
            waivedReason: qcItem.waivedReason,
            snTicket: qcItem.snTicket,
          },
        });
    }
  } catch (error) {
    console.error("[QCAction] Failed to save QC items", error);
    return { success: false, error: "Failed to save QC items" };
  }

  return { success: true };
}

