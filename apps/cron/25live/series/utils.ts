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

    // Check series-level definition for academic session marker
    const itemName =
      series.itemDetails?.defn?.panel?.[1]?.item?.[0]?.itemName ?? null;

    // Only include KEC series that are academic/class sessions
    return (
      itemName === "<p>Academic Session</p>" ||
      itemName === "<p>Academic session</p>" ||
      itemName === "<p>Class Session</p>" ||
      itemName === "<p>Class session</p>"
    );
  });
}

