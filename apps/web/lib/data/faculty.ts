"use server";
import { unstable_cache } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { eq, db, faculty, facultySetup, type InferSelectModel } from "shared";

const PAGE_SIZE = 50;
import { revalidateTag, updateTag } from "next/cache";

async function fetchFacultyPage(page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  try {
    const data: InferSelectModel<typeof faculty>[] =
      await db.query.faculty.findMany({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });

    return data;
  } catch (error) {
    console.error("[db] faculty.fetchFacultyPage", { page, from, to, error });
    throw error;
  }
}

export const getFacultyPage = async (page: number) =>
  unstable_cache(() => fetchFacultyPage(page), ["faculty", `page:${page}`], {
    revalidate: 3600,
    tags: ["faculty"],
  })();

export const getFacultyById = unstable_cache(
  async (id: number) => {
    try {
      const data = await db.query.faculty.findFirst({
        where: eq(faculty.id, id),
      });
      return data;
    } catch (error) {
      console.error("[db] faculty.getFacultyById", { id, error });
      throw error;
    }
  },
  ["faculty"],
  { tags: ["faculty"] }
);

export const getFacultySetups = unstable_cache(
  async (id: number) => {
    try {
      const data = await db.query.facultySetup.findMany({
        where: eq(facultySetup.faculty, id),
      });
      console.log("getting setup not from cache", data);
      return data;
    } catch (error) {
      console.error("[db] faculty.getFacultySetups", { id, error });
      throw error;
    }
  },
  ["facultysetup"],
  { tags: ["facultysetup"] }
);

export async function createFacultySetup(
  data: Partial<InferSelectModel<typeof facultySetup>> & { faculty: number }
) {
  "use server";

  try {
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
  } catch (error) {
    console.error("[db] faculty.createFacultySetup", { data, error });
    throw error;
  }
}

export async function updateFacultySetup(
  setupId: string,
  data: Partial<InferSelectModel<typeof facultySetup>>
) {
  "use server";
  console.log("updating setup");

  try {
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
  } catch (error) {
    console.error("[db] faculty.updateFacultySetup", { setupId, data, error });
    throw error;
  }
}

export async function deleteFacultySetup(setupId: string) {
  "use server";

  try {
    await db.delete(facultySetup).where(eq(facultySetup.id, setupId));
  } catch (error) {
    console.error("[db] faculty.deleteFacultySetup", { setupId, error });
    throw error;
  }

  updateTag("facultysetup");
}
