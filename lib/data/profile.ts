'use server'
import { requireUserId } from "@/lib/auth/requireUser";
import { profiles } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

export const  getProfile = async (userId: string) =>
  unstable_cache(
    async () => {
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, userId),
      });
      return profile;
    },
    ["profile", userId],
    { tags: [`profile:${userId}`] }
  )();

const getMyProfile = async () => {
  const user = await requireUserId();

  return { profile: await getProfile(user.id), email: user.email };
};
export async function saveMyProfile(
  patch: Partial<{ autoHide: boolean; currentFilter: string }>
) {
  "use server";
  const user = await requireUserId();

  await db.update(profiles).set(patch).where(eq(profiles.id, user.id));
  revalidateTag(`profile:${user.id}`);
}

export default getMyProfile;
