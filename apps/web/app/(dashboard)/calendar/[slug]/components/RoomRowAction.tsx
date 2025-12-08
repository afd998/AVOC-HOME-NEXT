"use client";

import Link from "next/link";
import ActionIcon from "@/core/actions/ActionIcon";
import { getProfileDisplayName } from "@/core/User/utils";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { cn } from "@/lib/utils";
import {
  convertTimeToMinutes,
  formatTime,
  getActionDisplayName,
} from "@/app/(dashboard)/calendar/[slug]/components/ActionsPanel/utils";
import { buttonVariants } from "@/components/ui/button";
import { useActionHoverStore } from "@/lib/stores/action-hover";

type RoomRowActionProps = {
  action: HydratedAction;
  rowHeightPx: number;
  stackIndex: number;
  stackCount: number;
};

const ACTION_BUTTON_SIZE = 34;
const NOTCH_LENGTH_PX = 8;
const ACTION_Z_INDEX = 50;

export default function RoomRowAction({
  action,
  rowHeightPx,
  stackIndex,
  stackCount,
}: RoomRowActionProps) {
  const title = getActionDisplayName(action);
  const startLabel = action.startTime ? formatTime(action.startTime) : "TBD";
  const assignedProfile =
    action.assignedToManualProfile ?? action.assignedToProfile ?? null;
  const assignedName = getProfileDisplayName(assignedProfile);
  const actionId = action.id ?? null;
  const setHoveredActionId = useActionHoverStore(
    (state) => state.setHoveredActionId
  );
  const actionPanelHoverId = useActionHoverStore(
    (state) => state.actionPanelHoverId
  );
  const normalizedStatus = action.status?.trim().toLowerCase() ?? null;
  const isCompleted = normalizedStatus === "completed";
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayLocalIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const actionDate = action.eventDetails?.date ?? null;
  const startMinutesAbsolute = convertTimeToMinutes(action.startTime);
  const isSameDay = typeof actionDate === "string" ? actionDate === todayLocalIso : false;
  const isOverdue =
    !isCompleted &&
    isSameDay &&
    startMinutesAbsolute !== null &&
    startMinutesAbsolute <= nowMinutes;

  const isPanelHover =
    actionPanelHoverId !== null &&
    actionPanelHoverId !== undefined &&
    String(actionPanelHoverId) === String(action.id);

  const statusClasses = isCompleted
    ? "text-emerald-600 hover:text-emerald-700 dark:text-emerald-200 dark:hover:text-emerald-100"
    : isOverdue
      ? "text-rose-600 hover:text-rose-700 dark:text-rose-200 dark:hover:text-rose-100"
      : "text-primary hover:text-primary/80";

  const ringClasses = cn(
    isCompleted
      ? "ring-emerald-300/70 dark:ring-emerald-800"
      : isOverdue
        ? "ring-rose-300/70 dark:ring-rose-900"
        : "ring-border",
    isPanelHover && "ring-2 ring-primary/80"
  );

  const STACK_GAP = -20;
  const clusterHeight =
    stackCount * ACTION_BUTTON_SIZE + (stackCount - 1) * STACK_GAP;
  const baseTop = Math.max(
    4,
    Math.round(rowHeightPx / 2 - clusterHeight / 2)
  );
  const top = baseTop + stackIndex * (ACTION_BUTTON_SIZE + STACK_GAP);
  const rawLeftValue = action.derived?.left ?? "0";
  const numericLeft = (() => {
    if (typeof rawLeftValue === "number") {
      return rawLeftValue;
    }
    if (typeof rawLeftValue === "string") {
      const parsed = Number.parseFloat(rawLeftValue.replace("px", ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  })();
  const centeredLeft = Math.max(0, numericLeft - ACTION_BUTTON_SIZE / 2);

  const linkedEventTitle =
    action.eventDetails?.eventName?.trim() ||
    action.eventDetails?.series?.seriesName?.trim() ||
    null;
  const source = action.source?.trim() || null;

  const detailLabelParts = [
    startLabel,
    assignedName ? `Assigned to ${assignedName}` : null,
    linkedEventTitle ? `Event: ${linkedEventTitle}` : null,
    source ? `Source: ${source}` : null,
  ].filter(Boolean);
  const ariaLabel = detailLabelParts.length
    ? `${title}. ${detailLabelParts.join(". ")}`
    : title;

  const handlePointerEnter = () => {
    if (actionId !== null && actionId !== undefined) {
      setHoveredActionId(actionId);
    }
  };

  const handlePointerLeave = () => {
    setHoveredActionId(null);
  };

  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: centeredLeft,
        top,
        width: `${ACTION_BUTTON_SIZE}px`,
        zIndex: ACTION_Z_INDEX,
      }}
    >
      <Link
        href={`/actions/${action.id}`}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm",
          "hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-offset-2",
          ringClasses,
          statusClasses
        )}
        style={{
          width: `${ACTION_BUTTON_SIZE}px`,
          height: `${ACTION_BUTTON_SIZE}px`,
        }}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onFocus={handlePointerEnter}
        onBlur={handlePointerLeave}
      >
        {(stackCount === 1 || stackIndex < stackCount - 1) && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 block w-px -translate-x-1/2 -translate-y-full bg-muted-foreground/60"
            style={{ height: `${NOTCH_LENGTH_PX}px` }}
          />
        )}
        {(stackCount === 1 || stackIndex > 0) && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 bottom-0 block w-px -translate-x-1/2 translate-y-full bg-muted-foreground/60"
            style={{ height: `${NOTCH_LENGTH_PX}px` }}
          />
        )}
        <ActionIcon
          action={action}
          size="sm"
          className="border-none bg-transparent"
        />
      </Link>
    </div>
  );
}
