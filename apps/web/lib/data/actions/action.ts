import { eq, db, actions as actionsTable, type EventAVConfigRow } from "shared";
import type { ActionWithDict, EventWithResourceDetails } from "./actions";

export async function getActionById(
  actionId: string
): Promise<ActionWithDict | null> {
  const numericId = Number(actionId);
  
  // Validate that actionId is a valid integer
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const action = await db.query.actions.findFirst({
    where: eq(actionsTable.id, numericId),
    with: {
      event: {
        with: {
          resourceEvents: {
            with: {
              resourcesDict: true,
            },
          },
          eventAvConfigs: true,
          eventHybrids: true,
          eventRecordings: true,
          eventOtherHardwares: {
            with: {
              otherHardwareDict: true,
            },
          },
        },
      },
      profile_assignedTo: true,
      profile_completedBy: true,
      qcItems: {
        with: {
          qcItemDict: true,
        },
      },
    },
  });

  if (!action) {
    return null;
  }

  const { event, profile_assignedTo, profile_completedBy, qcItems, ...actionData } = action;

  const eventWithResources = event as EventWithResourceDetails | null;

  return {
    ...actionData,
    eventDetails: eventWithResources ?? null,
    assignedToProfile: profile_assignedTo ?? null,
    completedByProfile: profile_completedBy ?? null,
    qcItems: (qcItems ?? []).map((item) => ({
      ...item,
      qcItemDict: item.qcItemDict ?? null,
    })),
  } as unknown as ActionWithDict;
}

