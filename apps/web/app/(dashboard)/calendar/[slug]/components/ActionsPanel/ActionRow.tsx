import Link from "next/link";
import { Check } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import UserAvatar from "@/core/User/UserAvatar";
import { getProfileDisplayName } from "@/core/User/utils";
import ActionIcon from "@/core/actions/ActionIcon";

import { convertTimeToMinutes, getActionDisplayName } from "./utils";
import { actionOverdueClassName } from "./actionOverdueStyles";
import type { EnhancedAction } from "./types";

type ActionRowProps = {
  entry: EnhancedAction;
};

export default function ActionRow({ entry }: ActionRowProps) {
  const { action, roomName } = entry;
  const assignedProfile = action.assignedToProfile;
  const assignedName = getProfileDisplayName(assignedProfile);

  const title = getActionDisplayName(action);
  const normalizedStatus = action.status?.trim() || null;
  const isCompleted =
    normalizedStatus?.toLowerCase() === "completed";
  const startMinutesAbsolute = convertTimeToMinutes(action.startTime);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayLocalIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  
  // Get date from event details
  const actionDate = action.eventDetails?.date;
  const isSameDay =
    typeof actionDate === "string"
      ? actionDate === todayLocalIso
      : false;
  const isOverdue =
    !isCompleted &&
    isSameDay &&
    startMinutesAbsolute !== null &&
    startMinutesAbsolute <= nowMinutes;
  const subtitleParts = [action.eventDetails?.eventName?.trim()].filter(Boolean);
  const subtitle = subtitleParts.join(" | ");

  const iconColorOverride = isCompleted
    ? "text-emerald-600"
    : isOverdue
      ? "text-rose-600"
      : undefined;

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn(
        "items-start gap-3 px-3 py-2 transition-colors",
        isCompleted
          ? " hover:bg-emerald-50  border-emerald-200 bg-emerald-50 dark:bg-emerald-900 dark:border-emerald-800"
          : isOverdue
            ? "border-rose-200 bg-rose-100/70 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50"
            : "bg-muted/40 dark:bg-muted/90",
        isOverdue && actionOverdueClassName
      )}
      asChild
    >
      <Link
        href={`/actions/${action.id}`}
        className={cn(
          "flex w-full items-start gap-3 no-underline transition-colors",
          isCompleted
            ? "hover:!bg-emerald-100 dark:hover:!bg-emerald-900/60"
            : isOverdue
              ? "hover:!bg-rose-200 dark:hover:!bg-rose-900/70"
              : "hover:!bg-muted/70 dark:hover:!bg-muted/40"
        )}
      >
        <ItemMedia
          variant="default"
          className="mt-1"
        >
          <ActionIcon
            action={action}
            size="sm"
            variant="muted"
            colorClassName={iconColorOverride}
          />
        </ItemMedia>
        <ItemContent className="flex-1 gap-1">
          <ItemTitle className="text-sm font-medium leading-tight">
            {title}
          </ItemTitle>
          <ItemDescription className="text-xs text-muted-foreground">
            {subtitle || "No additional details"}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="ml-auto flex items-center gap-3 text-xs font-medium uppercase">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{(roomName || "").replace(/^GH\s+/i, "")}</span>
            {assignedProfile ? (
              <UserAvatar
                profile={assignedProfile as any}
                size="sm"
                variant="solid"
                className="h-[20px] w-[20px] shrink-0"
              />
            ) : null}
          </div>
          {isCompleted ? (
            <Check
              aria-label="Completed"
              className="h-4 w-4 shrink-0 text-emerald-600"
            />
          ) : null}
        </ItemActions>
      </Link>
    </Item>
  );
}
