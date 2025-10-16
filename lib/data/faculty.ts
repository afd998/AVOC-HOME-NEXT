"use server";
import { unstable_cache } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { db } from "../db";
import { faculty, facultySetup } from "@/drizzle/schema";
const PAGE_SIZE = 50;
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { revalidateTag, updateTag } from "next/cache";

async function fetchFacultyPage(page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const data: InferSelectModel<typeof faculty>[] =
    await db.query.faculty.findMany({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });

  return data;
}

export const getFacultyPage = async (page: number) =>
  unstable_cache(() => fetchFacultyPage(page), ["faculty", `page:${page}`], {
    revalidate: 3600,
    tags: ["faculty"],
  })();

export const getFacultyById = unstable_cache(
  async (id: number) => {
    const data = await db.query.faculty.findFirst({
      where: eq(faculty.id, id),
    });
    return data;
  },
  ["faculty"],
  { tags: ["faculty"] }
);

export const getFacultySetups = unstable_cache(
  async (id: number) => {
    const data = await db.query.facultySetup.findMany({
      where: eq(facultySetup.faculty, id),
    });
    console.log("getting setup not from cache", data);
    return data;
  },
  ["facultysetup"],
  { tags: ["facultysetup"] }
);

export async function createFacultySetup(
  data: Partial<InferSelectModel<typeof facultySetup>> & { faculty: number }
) {
  "use server";

  const [result] = await db
    .insert(facultySetup)
    .values({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any)
    .returning();

  updateTag("facultysetup");

  return result;
}

export async function updateFacultySetup(
  setupId: string,
  data: Partial<InferSelectModel<typeof facultySetup>>
) {
  "use server";
  console.log("updating setup");

  const [result] = await db
    .update(facultySetup)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(facultySetup.id, setupId))
    .returning();
 console.log("result", result);

  updateTag("facultysetup");

  return result;
}

export async function deleteFacultySetup(setupId: string) {
  "use server";

  await db.delete(facultySetup).where(eq(facultySetup.id, setupId));

  updateTag("facultysetup");
}
