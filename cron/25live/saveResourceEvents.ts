import { inArray } from "drizzle-orm";
import { db } from "../../lib/db";
import { resourceEvents, resourcesDict } from "../../lib/db/schema";
import { type ProcessedEvent } from "./transformRawEventsToEvents/transformRawEventsToEvents";
import { type InferInsertModel } from "drizzle-orm";

type ResourceEventRow = InferInsertModel<typeof resourceEvents>;
type ResourceDictRow = InferInsertModel<typeof resourcesDict>;

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeQuantity = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  // Quantity cannot be negative; default to 1 in that case.
  return value > 0 ? Math.floor(value) : 1;
};

export async function saveResourceEvents(
  processedEvents: ProcessedEvent[]
): Promise<void> {
  const processedEventIds = processedEvents
    .map((event) => event.id)
    .filter((id): id is number => typeof id === "number");

  const resourceIdSet = new Set<string>();

  const resourceMetadata = new Map<string, { name: string }>();

  processedEvents.forEach((event) => {
    event.resources.forEach((resource) => {
      const resourceId = resource.itemName;
      if (resourceId) {
        resourceIdSet.add(resourceId);
        if (!resourceMetadata.has(resourceId)) {
          const normalizedName = normalizeString(resource.itemName) ?? resourceId;
          resourceMetadata.set(resourceId, { name: normalizedName });
        }
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
          isAv: false,
          icon: null,
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

    missingResourceIds.forEach((id) => resourcesFound.add(id));
  }

  const seenPairs = new Set<string>();
  const joinRows: ResourceEventRow[] = [];

  processedEvents.forEach((event) => {
    event.resources.forEach((resource) => {
      const resourceId = resource.itemName;
      if (!resourcesFound.has(resourceId)) {
        return;
      }

      const pairKey = `${event.id}-${resourceId}`;
      if (seenPairs.has(pairKey)) {
        return;
      }

      seenPairs.add(pairKey);

      const quantity = normalizeQuantity(resource?.quantity ?? null);
      const instructions = normalizeString(resource?.instruction);

      joinRows.push({
        eventId: event.id,
        resourceId,
        quantity,
        instructions,
      });
    });
  });

  if (processedEventIds.length > 0) {
    await db
      .delete(resourceEvents)
      .where(inArray(resourceEvents.eventId, processedEventIds));
  }

  if (joinRows.length > 0) {
    console.log(`Inserting ${joinRows.length} resource-event relationships`);
    await db.insert(resourceEvents).values(joinRows);
  } else {
    console.log("No resource-event relationships to insert");
  }
}
