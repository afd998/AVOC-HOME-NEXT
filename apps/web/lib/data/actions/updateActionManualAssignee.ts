import { eq, db, actions as actionsTable } from "shared";
import { revalidateTag } from "next/cache";
import { getActionById } from "./action";
import type { ActionWithDict } from "./actions";

type UpdateManualAssigneeOptions = {
  actionId: number;
  profileId: string | null;
};

export async function updateActionManualAssignee(
  options: UpdateManualAssigneeOptions
): Promise<ActionWithDict | null> {
  const { actionId, profileId } = options;

  try {
    const [updated] = await db
      .update(actionsTable)
      .set({ assignedToManual: profileId })
      .where(eq(actionsTable.id, actionId))
      .returning({ id: actionsTable.id });

    if (!updated) {
      return null;
    }

    const action = await getActionById(String(actionId));

    const eventDate = action?.eventDetails?.date;
    if (eventDate) {
      try {
        await revalidateTag(`calendar:${eventDate}`);
      } catch (revalidateError) {
        console.error(
          "[updateActionManualAssignee] revalidateTag failed",
          revalidateError
        );
      }
    }

    return action;
  } catch (error) {
    console.error("[db] actions.updateActionManualAssignee failed", {
      actionId,
      profileId,
      error,
    });
    throw error;
  }
}
