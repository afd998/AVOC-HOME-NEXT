"use server";
import { eq, db, profiles } from "shared";
import { requireUserId } from "@/lib/auth/requireUser";
import { revalidateTag } from "next/cache";
import { unstable_cacheTag as cacheTag } from "next/cache";
export const getProfile = async (userId: string) => {
  "use cache";
  cacheTag(`profile:${userId}`);
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
    return profile;
  } catch (error) {
    console.error("[db] profile.getProfile", { userId, error });
    throw error;
  }
};

const getMyProfile = async () => {
  const user = await requireUserId();
  return { profile: await getProfile(user.id), email: user.email };
};

export async function saveMyProfile(
  patch: Partial<{ autoHide: boolean; currentFilter: string }>
) {
  "use server";
  const user = await requireUserId();

  try {
    await db.update(profiles).set(patch).where(eq(profiles.id, user.id));
  } catch (error) {
    console.error("[db] profile.saveMyProfile", {
      userId: user.id,
      patch,
      error,
    });
    throw error;
  }
  revalidateTag(`profile:${user.id}`, "layout");
}

export default getMyProfile;
