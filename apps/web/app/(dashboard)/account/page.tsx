import { redirect } from "next/navigation";
import type { Profile } from "shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/core/User/UserAvatar";
import getMyProfile from "@/lib/data/profile";
import { createServerSupabase } from "@/lib/supabase/server";

const formatHourRange = (start?: number | null, end?: number | null) => {
  if (start == null || end == null) return "Not set";
  return `${start}:00 - ${end}:00`;
};

const formatZoom = (zoom?: number | null) => {
  if (!zoom) return "Default (100%)";
  return `${Math.round(zoom * 100)}%`;
};

const formatNumber = (value?: number | bigint | null) => {
  if (value == null) return "Default";
  return value.toString();
};

export default async function AccountPage() {
  const { profile, email } = await getMyProfile();
  const safeProfile: Profile =
    profile ??
    ({
      id: "unknown",
      name: "Unknown user",
      roles: [],
      autoHide: false,
      currentFilter: null,
      bg: null,
      color: null,
      theme: "dark",
      zoom: 1,
      pixelsPerMin: null,
      rowHeight: null,
      startHour: null,
      endHour: null,
    } satisfies Profile);

  const roles = Array.isArray(safeProfile.roles) ? safeProfile.roles : [];

  const signOut = async () => {
    "use server";
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <UserAvatar profile={safeProfile} size="lg" className="h-12 w-12 rounded-lg" variant="solid" />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-muted-foreground">
            View your profile details and manage your session.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic information about your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{safeProfile.name ?? "Unknown user"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{email ?? "Not available"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-mono text-muted-foreground">{safeProfile.id}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Roles</span>
              <div className="flex flex-wrap gap-2">
                {roles.length > 0 ? (
                  roles.map((role: string) => (
                    <Badge key={role} variant="outline" className="capitalize">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No roles</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Defaults applied across the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <Badge variant="outline" className="capitalize">
                {safeProfile.theme ?? "Not set"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto-hide empty rooms</span>
              <Badge variant="outline">
                {safeProfile.autoHide ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current filter</span>
              <span className="text-sm font-medium">
                {safeProfile.currentFilter ?? "None selected"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Zoom</span>
              <span className="text-sm font-medium">{formatZoom(safeProfile.zoom)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pixels per minute</span>
              <span className="text-sm font-medium">
                {formatNumber(safeProfile.pixelsPerMin)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Row height</span>
              <span className="text-sm font-medium">
                {formatNumber(safeProfile.rowHeight)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Schedule window</span>
              <span className="text-sm font-medium">
                {formatHourRange(
                  typeof safeProfile.startHour === "bigint"
                    ? Number(safeProfile.startHour)
                    : safeProfile.startHour,
                  typeof safeProfile.endHour === "bigint"
                    ? Number(safeProfile.endHour)
                    : safeProfile.endHour
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{email ?? "unknown"}</span>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
