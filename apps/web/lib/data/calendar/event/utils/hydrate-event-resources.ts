import { inArray } from "drizzle-orm";
import { db, resourcesDict } from "shared";
import { EventWithDisplay } from "./hydrate-display-columns";

export type CalendarEventResource = {
  id: string;
  quantity: number;
  instruction: string;
  displayName: string;
  isAVResource: boolean;
  is_av: boolean;
  icon: unknown | null;
};

export type EventWithResources<
  T extends EventWithDisplay = EventWithDisplay
> = T & {
  resources: CalendarEventResource[];
};

export async function hydrateEventsWithResources(
  events: EventWithDisplay[]
): Promise<EventWithResources[]> {
  type RawEventResource = {
    itemName: string;
    quantity?: number;
    instruction?: string | null;
  };

  type ResourceMetadata = {
    id: string;
    displayName: string | null;
    isAv: boolean | null;
    icon: unknown;
  };

  const getString = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value : null;

  const normalizeResource = (resource: unknown): RawEventResource | null => {
    if (!resource || typeof resource !== "object") {
      return null;
    }

    const candidate = resource as Record<string, unknown>;

    const itemName = getString(candidate.itemName);
    if (!itemName) {
      return null;
    }

    const quantitySource = candidate.quantity;
    const instructionSource = getString(candidate.instruction);

    return {
      itemName,
      quantity:
        typeof quantitySource === "number" && Number.isFinite(quantitySource)
          ? quantitySource
          : undefined,
      instruction: instructionSource ?? null,
    } as RawEventResource;
  };

  const resourceIds = new Set<string>();
  events.forEach((event) => {
    if (!Array.isArray(event.resources)) {
      return;
    }
    (event.resources as unknown[]).forEach((resource) => {
      const normalized = normalizeResource(resource);
      if (normalized) {
        resourceIds.add(normalized.itemName);
      }
    });
  });

  if (resourceIds.size === 0) {
    return events.map((event) => ({
      ...event,
      resources: [],
    }));
  }

  const resourceMetadata = await (async () => {
    try {
      return await db
        .select({
          id: resourcesDict.id,
          displayName: resourcesDict.name,
          isAv: resourcesDict.isAv,
          icon: resourcesDict.icon,
        })
        .from(resourcesDict)
        .where(inArray(resourcesDict.id, Array.from(resourceIds)));
    } catch (error) {
      console.error("[db] hydrateEventsWithResources", {
        resourceIds: Array.from(resourceIds),
        error,
      });
      throw error;
    }
  })();

  const metadataById = new Map<string, ResourceMetadata>(
    resourceMetadata.map((entry) => [entry.id, entry])
  );

  return events.map((event) => {
    if (!Array.isArray(event.resources) || event.resources.length === 0) {
      return {
        ...event,
        resources: [],
      };
    }

    const resourcesWithMetadata = (event.resources as unknown[])
      .map((resource) => normalizeResource(resource))
      .filter((resource): resource is RawEventResource => resource !== null)
      .map<CalendarEventResource>((resource) => {
        const metadata = metadataById.get(resource.itemName);
        const isAv =
          typeof metadata?.isAv === "boolean" ? metadata.isAv : false;

        return {
          id: resource.itemName,
          quantity: resource.quantity ?? 0,
          instruction: resource.instruction ?? "",
          displayName: metadata?.displayName ?? resource.itemName,
          isAVResource: isAv,
          is_av: isAv,
          icon: metadata?.icon ?? null,
        };
      });

    const enrichedEvent: EventWithResources = {
      ...event,
      resources: resourcesWithMetadata,
    };

    return enrichedEvent;
  });
}
