import type { RawEvent } from "../schemas";
import { getEventType } from "../events/index";

/**
 * Filters out KEC series that are not academic sessions.
 * KEC (Kellogg Executive Education) series should only be included
 * if they are marked as Academic/Class sessions in the series definition.
 * 
 * This filter should be applied to raw series data BEFORE exploding into events.
 */
export function filterNonAcademicKECSeries(
  seriesList: RawEvent[]
): RawEvent[] {
  return seriesList.filter((series) => {
    // Check series type
    const eventType = getEventType(series);
    
    // Non-KEC series pass through
    if (eventType !== "KEC") {
      return true;
    }

    // Note: Academic session marker check removed as it's not available in new API structure
    // All KEC series will pass through for now
    // TODO: If academic session filtering is needed, find where this data exists in new API
    return true;
  });
}

