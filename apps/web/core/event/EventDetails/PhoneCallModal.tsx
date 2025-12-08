"use client";

import { useMemo, useState } from "react";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/core/User/UserAvatar";
import { getProfileDisplayName } from "@/core/User/utils";
import ActionIcon from "@/core/actions/ActionIcon";
import { formatTime } from "@/app/utils/dateTime";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Phone } from "lucide-react";

interface PhoneCallModalProps {
  event: finalEvent | undefined;
  actions: finalEvent["actions"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getActionDisplayName(type: string | null, subType: string | null): string {
  return subType?.trim() || type?.trim() || "Action";
}

function getStatusVariant(status: string | null | undefined) {
  const normalizedStatus = status?.trim().toLowerCase();
  switch (normalizedStatus) {
    case "completed":
      return "affirmative";
    case "cancelled":
    case "canceled":
      return "destructive";
    case "in progress":
    case "processing":
      return "secondary";
    default:
      return "outline";
  }
}

export default function PhoneCallModal({
  event,
  actions,
  open,
  onOpenChange,
}: PhoneCallModalProps) {
  const [assistanceType, setAssistanceType] = useState("session-setup");
  const sortedActions = useMemo(
    () =>
      [...(actions ?? [])].sort((a, b) => {
        const timeA = a.startTime || "";
        const timeB = b.startTime || "";
        return timeA.localeCompare(timeB);
      }),
    [actions]
  );

  const eventStart =
    event?.date && event?.startTime
      ? new Date(`${event.date}T${event.startTime}`)
      : null;
  const formattedEventStart = eventStart
    ? eventStart.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Staff Assistance Action</DialogTitle>
          <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <span>Source:</span>
            <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px]">
              <Phone className="h-3 w-3" />
              <span>Phone call</span>
            </Badge>
          </p>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <p className="font-medium">{event?.eventName ?? "Untitled Event"}</p>
          <p className="text-muted-foreground">
            {formattedEventStart ?? "Time TBD"}
            {event?.roomName ? ` · ${event.roomName.replace(/^GH\s+/i, "")}` : ""}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select request type
          </p>
          <ToggleGroup
            type="single"
            value={assistanceType}
            onValueChange={(value) => value && setAssistanceType(value)}
            spacing={8}
            className="w-full justify-between"
          >
            <ToggleGroupItem value="session-setup" className="flex-1">
              Session setup
            </ToggleGroupItem>
            <ToggleGroupItem value="session-troubleshoot" className="flex-1">
              Session troubleshoot
            </ToggleGroupItem>
            <ToggleGroupItem value="session-consultation" className="flex-1">
              Session consultation
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-3">
          {sortedActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No actions are assigned to this event yet.
            </p>
          ) : (
            sortedActions.map((action) => {
              const assignedProfile = action.assignedToManualProfile ?? action.assignedToProfile;
              const assignedName = getProfileDisplayName(assignedProfile);
              const formattedTime = action.startTime ? formatTime(action.startTime) : null;
              const displayName = getActionDisplayName(action.type, action.subType);

              return (
                <div
                  key={action.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-start gap-3">
                    <ActionIcon action={action} size="md" />
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">{displayName}</p>
                      {formattedTime && (
                        <p className="text-xs text-muted-foreground">Start {formattedTime}</p>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(action.status)} className="text-xs">
                      {action.status ?? "Pending"}
                    </Badge>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Assigned:</span>
                      {assignedProfile ? (
                        <>
                          <UserAvatar profile={assignedProfile} size="xs" className="shrink-0" />
                          <span>{assignedName}</span>
                        </>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
