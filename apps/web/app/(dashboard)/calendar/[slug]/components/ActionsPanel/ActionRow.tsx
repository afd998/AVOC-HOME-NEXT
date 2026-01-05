"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import UserAvatar from "@/core/User/UserAvatar";
import { getProfileDisplayName } from "@/core/User/utils";
import ActionIcon from "@/core/actions/ActionIcon";
import { EventFacultySummary } from "@/core/event/components/EventFacultySummary";
import { useActionHoverStore } from "@/lib/stores/action-hover";
import {
  isLectureSeriesType,
  truncateLectureSeriesTitle,
} from "@/core/series/util";

import { convertTimeToMinutes, getActionDisplayName } from "./utils";
import { actionOverdueClassName } from "./actionOverdueStyles";
import type { EnhancedAction } from "./types";

type ActionRowProps = {
  entry: EnhancedAction;
  hideAssignedAvatar?: boolean;
};

export default function ActionRow({
  entry,
  hideAssignedAvatar = false,
}: ActionRowProps) {
  const { action, roomName } = entry;
  const hoveredActionId = useActionHoverStore(
    (state) => state.hoveredActionId
  );
  const actionPanelHoverId = useActionHoverStore(
    (state) => state.actionPanelHoverId
  );
  const setActionPanelHover = useActionHoverStore(
    (state) => state.setActionPanelHover
  );
  const isTimelineHover =
    hoveredActionId !== null &&
    hoveredActionId !== undefined &&
    String(hoveredActionId) === String(action.id);
  const isPanelHover =
    actionPanelHoverId !== null &&
    actionPanelHoverId !== undefined &&
    String(actionPanelHoverId) === String(action.id);
  const assignedProfile =
    action.assignedToManualProfile ?? action.assignedToProfile;
  const assignedName = getProfileDisplayName(assignedProfile);

  const actionDisplayName = getActionDisplayName(action);
  const seriesName = action.eventDetails?.series?.seriesName?.trim();
  const title =
    action.eventDetails?.eventName?.trim() || seriesName || "Linked Event";
  const seriesType =
    action.eventDetails?.eventType ?? action.eventDetails?.series?.seriesType;
  const displayTitle = isLectureSeriesType(seriesType)
    ? truncateLectureSeriesTitle(title)
    : title;
  const faculty =
    ((action.eventDetails?.series as any)?.seriesFaculties ?? [])
      .map((relation: any) => relation?.faculty)
      .filter(Boolean) ?? [];
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
            : "bg-card",
        isOverdue && actionOverdueClassName,
        (isTimelineHover || isPanelHover) &&
          "border-primary/70 bg-primary/15 shadow-[0_0_12px_rgba(59,130,246,0.35)] dark:bg-primary/25"
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
              : "hover:!bg-muted/70 dark:hover:!bg-muted/40",
          (isTimelineHover || isPanelHover) && "!bg-primary/20 dark:!bg-primary/30"
        )}
        onMouseEnter={() => setActionPanelHover(action.id)}
        onMouseLeave={() => setActionPanelHover(null)}
      >
        <ItemMedia
          variant="default"
          className="mt-1"
        >
          <ActionIcon
            action={action}
            size="sm"
            tooltip={actionDisplayName || undefined}
          />
        </ItemMedia>
        <ItemContent className="flex-1 gap-1">
          <ItemTitle className="text-sm font-medium leading-tight" title={title}>
            {faculty.length > 0 ? (
              <EventFacultySummary
                faculty={faculty}
                maxVisible={2}
                size="sm"
                showNames={false}
                className="flex-row items-center justify-start gap-1 shrink-0"
                avatarsClassName="justify-start"
                avatarClassName="h-6 w-6"
                overlapClassName="-space-x-2"
                remainingBadgeClassName="h-6 w-6 text-[10px]"
              />
            ) : null}
            {displayTitle}
          </ItemTitle>
        </ItemContent>
        <ItemActions className="ml-auto flex items-center gap-3 text-xs font-medium uppercase">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{(roomName || "").replace(/^GH\s+/i, "")}</span>
            {assignedProfile && !hideAssignedAvatar ? (
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
