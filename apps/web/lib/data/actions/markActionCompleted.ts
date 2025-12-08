import { eq, db, actions as actionsTable } from "shared";
import { revalidateTag } from "next/cache";
import { getActionById } from "./action";
import type { ActionWithDict } from "./actions";

type MarkActionCompletedOptions = {
  actionId: number;
  completedBy: string;
  completedTime?: string;
};

export async function markActionCompleted({
  actionId,
  completedBy,
  completedTime,
}: MarkActionCompletedOptions): Promise<ActionWithDict | null> {
  const timestamp = completedTime ?? new Date().toISOString();

  try {
    const [updated] = await db
      .update(actionsTable)
      .set({
        status: "COMPLETED",
        completedBy,
        completedTime: timestamp,
      })
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
          "[markActionCompleted] revalidateTag failed",
          revalidateError
        );
      }
    }

    return action;
  } catch (error) {
    console.error("[db] actions.markActionCompleted failed", {
      actionId,
      completedBy,
      error,
    });
    throw error;
  }
}
