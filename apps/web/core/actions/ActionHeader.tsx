"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, UserRound } from "lucide-react";
import { Icon } from "@iconify/react";
import ActionIcon from "./ActionIcon";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import {
  formatDateNumeric as formatActionDate,
  formatTime as formatActionTime,
} from "@/app/utils/dateTime";
import { formatDistanceToNow } from "date-fns";
import { useManualActionAssignee, useProfilesQuery } from "@/lib/query";
import type { ProfileRow } from "@/lib/data/actions/actions";
import UserAvatar from "@/core/User/UserAvatar";

interface ActionHeaderProps {
  action: HydratedAction;
  errorMessage?: string | null;
}

export default function ActionHeader({ action, errorMessage }: ActionHeaderProps) {
  const typeUpper = action.type?.toUpperCase() || "";
  const subTypeUpper = action.subType?.toUpperCase() || "";
  const isConfigAction =
    typeUpper.includes("CONFIG") || subTypeUpper.includes("CONFIG");
  const rawSubType = action.subType?.trim() || "";
  const rawType = action.type?.trim() || "";
  const displayName = isConfigAction
    ? "Configure Space"
    : rawSubType || rawType || "Action";
  const actionDate = action.eventDetails?.date ?? "";
  const formattedDate = formatActionDate(actionDate);
  const formattedTime = formatActionTime(action.startTime);
  const startDateTime =
    actionDate && action.startTime
      ? new Date(`${actionDate}T${action.startTime}`)
      : null;
  const timeUntilStart =
    startDateTime && !Number.isNaN(startDateTime.getTime())
      ? formatDistanceToNow(startDateTime, { addSuffix: true })
      : null;
  const venue =
    (action.eventDetails?.roomName ?? action.room ?? "").replace(/^GH\s+/i, "") ||
    "No venue";
  const venueHref =
    action.eventDetails?.venue != null ? `/venues/${action.eventDetails.venue}` : null;
  const autoAssignedProfile = action.assignedToProfile;
  const manualAssignedProfile = action.assignedToManualProfile;
  const displayedAssignee = manualAssignedProfile ?? autoAssignedProfile ?? null;
  const manualAssigneeId =
    typeof action.assignedToManual === "string" && action.assignedToManual.trim().length > 0
      ? action.assignedToManual
      : manualAssignedProfile?.id ?? null;

  const {
    data: profiles,
    isLoading: isProfilesLoading,
    error: profilesError,
  } = useProfilesQuery();

  const technicianProfiles = useMemo<ProfileRow[]>(
    () =>
      (profiles ?? []).filter((profile) => {
        const roles = profile.roles;
        return Array.isArray(roles) && roles.includes("TECHNICIAN");
      }),
    [profiles]
  );

  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const { mutateAsync: assignManualAssignee, isPending: isUpdatingAssignee } =
    useManualActionAssignee();

  const numericActionId =
    typeof action.id === "string" ? Number.parseInt(action.id, 10) : action.id;

  const handleManualAssign = useCallback(
    async (profileId: string | null) => {
      if (!numericActionId || Number.isNaN(numericActionId)) {
        setAssignmentError("Invalid action id.");
        return;
      }

      if (isUpdatingAssignee) {
        return;
      }

      setAssignmentError(null);

      try {
        await assignManualAssignee({
          actionId: numericActionId,
          profileId,
        });
        setAssigneePopoverOpen(false);
      } catch (error) {
        console.error("[ActionHeader] Failed to update manual assignee", error);
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Unable to update assignee.";
        setAssignmentError(message);
      }
    },
    [assignManualAssignee, isUpdatingAssignee, numericActionId]
  );

  const displayError =
    errorMessage ??
    assignmentError ??
    (profilesError ? "Unable to load technician list." : null);

  return (
    <CardHeader className="gap-4 shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ActionIcon action={action} size="lg" className="shrink-0" />
          <div className="flex flex-col gap-1 text-left">
            <CardTitle className="text-xl font-semibold">
              {displayName}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Icon icon="lucide:calendar" className="h-4 w-4" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                |
              </span>
              <span className="flex items-center gap-2">
                <Icon icon="lucide:clock-3" className="h-4 w-4" />
                <span>{formattedTime}</span>
                {timeUntilStart ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{timeUntilStart}</span>
                  </>
                ) : null}
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                |
              </span>
              {venueHref ? (
                <Link
                  href={venueHref}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Icon icon="lucide:map-pin" className="h-4 w-4" />
                  <span>{venue}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon icon="lucide:map-pin" className="h-4 w-4" />
                  <span>{venue}</span>
                </span>
              )}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3 self-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assigned to
          </span>
          <Popover
            open={assigneePopoverOpen}
            onOpenChange={setAssigneePopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 px-2"
                disabled={isProfilesLoading || isUpdatingAssignee}
              >
                {isUpdatingAssignee ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
                {displayedAssignee ? (
                  <>
                    <UserAvatar
                      profile={displayedAssignee}
                      size="sm"
                      variant="solid"
                    />
                    <span className="text-sm font-medium">
                      {displayedAssignee.name ?? displayedAssignee.id}
                    </span>
                  </>
                ) : (
                  <>
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  </>
                )}
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search technicians..." />
                <CommandList>
                  <CommandEmpty>
                    {isProfilesLoading ? "Loading technicians..." : "No technicians found."}
                  </CommandEmpty>
                  <CommandGroup heading="Technicians">
                    <CommandItem
                      value="unassigned"
                      onSelect={() => handleManualAssign(null)}
                      disabled={isUpdatingAssignee}
                    >
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <span>Auto-assign</span>
                      {manualAssigneeId == null ? (
                        <Check className="ml-auto h-4 w-4" />
                      ) : null}
                    </CommandItem>
                    {technicianProfiles.map((profile) => (
                      <CommandItem
                        key={profile.id}
                        value={profile.name ?? profile.id}
                        onSelect={() => handleManualAssign(profile.id)}
                        disabled={isUpdatingAssignee}
                      >
                        <UserAvatar profile={profile} size="sm" variant="solid" />
                        <span className="truncate">
                          {profile.name ?? profile.id}
                        </span>
                        {manualAssigneeId === profile.id ? (
                          <Check className="ml-auto h-4 w-4" />
                        ) : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {displayError ? (
        <p className="text-sm text-destructive">{displayError}</p>
      ) : null}
    </CardHeader>
  );
}
