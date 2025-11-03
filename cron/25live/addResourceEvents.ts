/**
 * Resource Events Management
 *
 * This module handles the relationship between events and their associated resources (AV equipment, furniture, etc.)
 * It maintains a dictionary of known resources and a join table linking resources to events.
 *
 * Database structure:
 * - resourcesDict: Master list of all resources (resource_id, name, isAv, icon)
 * - resourceEvents: Join table linking events to resources (event_id, resource_id, quantity, instructions)
 */

import { inArray } from "drizzle-orm";
import { db } from "../../lib/db";
import { resourceEvents, resourcesDict } from "../../lib/db/schema";
import { type ProcessedEvent } from "./transformRawEventsToEvents/transformRawEventsToEvents";
import { type InferInsertModel } from "drizzle-orm";
import { type EventAggregate } from "./scrape";
type ResourceEventRow = InferInsertModel<typeof resourceEvents>;
type ResourceDictRow = InferInsertModel<typeof resourcesDict>;

/**
 * Normalize and validate string values
 * Ensures strings are trimmed and not empty
 * @returns Cleaned string or null if invalid/empty
 */
const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Normalize and validate quantity values
 * Ensures quantities are positive integers, defaults to 1 if invalid
 * @returns Positive integer quantity (minimum 1)
 */
const normalizeQuantity = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  // Quantity cannot be negative; default to 1 in that case.
  return value > 0 ? Math.floor(value) : 1;
};

/**
 * Prepare the resource dictionary for the provided events.
 *
 * This function performs the following operations (formerly steps 1-8 of saveResourceEvents):
 * 1. Extract all unique resources from events
 * 2. Check which resources already exist in the dictionary
 * 3. Add any new resources to the dictionary
 * It returns the processed event IDs so callers can refresh join rows.
 */
const prepareResourceDictionary = async (eventGraph: EventAggregate[]) => {
  // Build a collection of unique resource IDs and their metadata.
  const resourceIdSet = new Set<string>();
  const resourceMetadata = new Map<string, { name: string }>();

  eventGraph.forEach((event) => {
    event.resources.forEach((resource) => {
      const resourceId = resource.itemName;
      if (!resourceId) {
        return;
      }

      resourceIdSet.add(resourceId);

      if (!resourceMetadata.has(resourceId)) {
        const normalizedName = normalizeString(resource.itemName) ?? resourceId;
        resourceMetadata.set(resourceId, { name: normalizedName });
      }
    });
  });

  const resourceIds = Array.from(resourceIdSet);
  const resourcesFound = new Set<string>();

  if (resourceIds.length > 0) {
    const dictionaryMatches = await db
      .select({ id: resourcesDict.id })
      .from(resourcesDict)
      .where(inArray(resourcesDict.id, resourceIds));

    dictionaryMatches.forEach(({ id }) => {
      resourcesFound.add(id);
    });
  }

  const missingResourceIds = resourceIds.filter(
    (id) => !resourcesFound.has(id)
  );

  if (missingResourceIds.length > 0) {
    const newDictionaryEntries: ResourceDictRow[] = missingResourceIds.map(
      (id) => {
        const metadata = resourceMetadata.get(id);
        return {
          id,
          name: metadata?.name ?? id,
          isAv: false, // Default to non-AV, can be updated manually later
          icon: null, // No icon by default
        };
      }
    );

    console.info(
      `Adding ${missingResourceIds.length} resources to dictionary`,
      missingResourceIds
    );

    await db
      .insert(resourcesDict)
      .values(newDictionaryEntries)
      .onConflictDoNothing();
  }
};

/**
 * Save resource-event relationships to the database
 *
 * This function performs the remaining operations:
 * 4. Create join table entries linking resources to events
 * 5. Replace old relationships with new ones (delete + insert)
 *
 * @param processedEvents - Array of events with their associated resources
 */
export async function addResourceEvents(
  eventGraph: EventAggregate[]
): Promise<void> {
  await prepareResourceDictionary(eventGraph);

  // STEP 9: Build join table rows linking events to resources
  // Track seen pairs to prevent duplicate entries for the same event-resource combination
  const seenPairs = new Set<string>();
  const joinRows: ResourceEventRow[] = [];

  eventGraph.forEach((event) => {
    event.resources.forEach((resource) => {
      const resourceId = resource.itemName;

      // Create unique key for this event-resource pair
      const pairKey = `${event.id}-${resourceId}`;
      seenPairs.add(pairKey);

      // Normalize the quantity and instructions for this resource
      const quantity = normalizeQuantity(resource?.quantity ?? null);
      const instructions = normalizeString(resource?.instruction);
      // Create the join table row
      joinRows.push({
        eventId: event.id,
        resourceId,
        quantity,
        instructions,
      });
    });
  });

  // STEP 10: Delete existing resource-event relationships for these events
  // This ensures we have a clean slate before inserting the new relationships
  // (handles cases where resources were removed from events)
  const processedEventIds = processedEvents.map((event) => event.id);
  if (processedEventIds.length > 0) {
    await db
      .delete(resourceEvents)
      .where(inArray(resourceEvents.eventId, processedEventIds));
  }

  // STEP 11: Insert the new resource-event relationships
  if (joinRows.length > 0) {
    console.log(`Inserting ${joinRows.length} resource-event relationships`);
    await db.insert(resourceEvents).values(joinRows);
  } else {
    console.log("No resource-event relationships to insert");
  }
}
