// lib/data/controls.ts
import { unstable_cache, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db, profiles } from "shared";
import { requireUserId } from "../auth/requireUser";

const fallbackControls = {
  zoom: 0,
  pixelsPerMin: 0,
  rowHeight: 0,
  startHour: 0,
  endHour: 0,
};

const getControlsCached = unstable_cache(
  async (userId: string) => {
    try {
      const row = await db.query.profiles.findFirst({
        columns: {
          zoom: true,
          pixelsPerMin: true,
          rowHeight: true,
          startHour: true,
          endHour: true,
        },
        where: eq(profiles.id, userId),
      });

      return row ?? { ...fallbackControls };
    } catch (error) {
      console.error("[db] controls.getControlsCached", { userId, error });
      throw error;
    }
  },
  ["controls"],
  { tags: ["controls"] }
);

export async function getControls(userId: string) {
  return getControlsCached(userId);
}

export async function getMyControls() {
  const user = await requireUserId();
  return getControls(user.id);
}

export async function saveMyControls(
  patch: Partial<{
    zoom: number;
    pixelsPerMin: number;
    rowHeight: number;
    startHour: number;
    endHour: number;
  }>
) {
  "use server";
  const user = await requireUserId();

  try {
    await db.update(profiles).set(patch).where(eq(profiles.id, user.id));
  } catch (error) {
    console.error("[db] controls.saveMyControls", {
      userId: user.id,
      patch,
      error,
    });
    throw error;
  }
  revalidateTag("controls");
}
