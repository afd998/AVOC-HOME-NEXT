import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createServerSupabase } from "@/lib/supabase/server";
import getMyProfile from "@/lib/data/profile";
import UserAvatar from "@/core/User/UserAvatar";

export async function ProfilePopover() {
  const { profile, email } = await getMyProfile();

  const signOut = async () => {
    "use server";
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 rounded-full p-0"
          aria-label="Open profile menu"
        >
          <UserAvatar
            profile={profile}
            size="md"
            className="h-8 w-8 rounded-full"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 p-0"
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              profile={profile}
              size="md"
              className="h-10 w-10 rounded-full"
            />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold leading-none">
                {profile?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </div>
        <div className="border-t">
          <Link
            href="/account"
            className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            <User className="h-4 w-4" />
            Profile Settings
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
