import {
  generateQcItems,
  type EnrichedEvent,
  type ActionRow,
  type QcItemRow,
} from "shared";

/**
 * Generate QC item rows for the given enriched events and actions.
 * Uses the shared QC generation logic.
 */
export async function makeQcItemRows(
  enrichedEvents: EnrichedEvent[],
  actions: ActionRow[]
): Promise<QcItemRow[]> {
  return generateQcItems(enrichedEvents, actions);
}
