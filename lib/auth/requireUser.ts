// lib/auth/requireUser.ts
import { createServerSupabase } from "@/lib/supabase/server";

export async function requireUserId() {
  "use server";
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
