import type { QcItemFormValues } from "@/core/actions/QcItem";
import { qcItems, type InferInsertModel } from "shared";

type QCItemInsert = InferInsertModel<typeof qcItems>;

/**
 * Transform QcItem form values to QC items database structure
 */
export function transformFormValuesToQcItems(
  formValues: QcItemFormValues,
  taskId: number
): QCItemInsert[] {
  const qcItemsData: QCItemInsert[] = [];
  const processedKeys = new Set<string>();

  // Iterate through form values to extract QC items
  for (const [key, value] of Object.entries(formValues)) {
    // Status fields format: `${qc}-${qcItemDictId}`
    if (!key.includes("-") || key.endsWith("-failMode") || key.endsWith("-waivedReason") || key.endsWith("-ticket")) {
      continue;
    }

    // Check if we've already processed this QC item
    if (processedKeys.has(key)) {
      continue;
    }

    const parts = key.split("-");
    if (parts.length !== 2) {
      continue;
    }

    const [qcStr, qcItemDictIdStr] = parts;
    const qcItemDictId = Number.parseInt(qcItemDictIdStr, 10);

    // Skip if qc doesn't match taskId or qcItemDictId is invalid
    const qc = Number.parseInt(qcStr, 10);
    if (qc !== taskId || Number.isNaN(qcItemDictId)) {
      continue;
    }

    processedKeys.add(key);

    // Get related form values
    const failModeKey = `${key}-failMode`;
    const waivedReasonKey = `${key}-waivedReason`;
    const ticketKey = `${key}-ticket`;

    const status = value as "pass" | "fail" | "na" | null | undefined;
    const failMode = formValues[failModeKey] as "waived" | "Ticketed" | "Resolved Immediately" | null | undefined;
    const waivedReason = formValues[waivedReasonKey] as string | null | undefined;
    const snTicket = formValues[ticketKey] as string | null | undefined;

    // Determine waived and failMode values
    const isWaived = failMode === "waived";
    const dbFailMode = isWaived ? null : (failMode === "Ticketed" || failMode === "Resolved Immediately" ? failMode : null);

    // Build QC item
    const qcItem: QCItemInsert = {
      qc: taskId,
      qcItemDict: qcItemDictId,
      status: status ?? null,
      waived: isWaived ? true : (dbFailMode !== null ? false : null),
      failMode: dbFailMode,
      waivedReason: isWaived && waivedReason ? waivedReason : null,
      snTicket: dbFailMode === "Ticketed" && snTicket ? snTicket : null,
    };

    qcItemsData.push(qcItem);
  }

  return qcItemsData;
}

