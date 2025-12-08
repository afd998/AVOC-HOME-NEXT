"use client";

import React from "react";
import { Badge } from "../../../../../components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../../../components/ui/context-menu";
import UserAvatar from "@/core/User/UserAvatar";
import Event from "@/app/(dashboard)/calendar/[slug]/components/Event/components/Event";
import { finalEvent } from "@/lib/data/calendar/calendar";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import Link from "next/link";
import RoomRowAction from "@/app/(dashboard)/calendar/[slug]/components/RoomRowAction";
import { convertTimeToMinutes } from "@/app/(dashboard)/calendar/[slug]/components/ActionsPanel/utils";

interface RoomRowProps {
  room: string;
  roomEvents: finalEvent[];
  isEvenRow?: boolean; // Make optional with default
  isLastRow?: boolean; // Add prop for last row styling
  showLabel?: boolean;
  interactive?: boolean;
  isSelected?: boolean;
  onSelectRoom?: (room: string, event: React.MouseEvent<HTMLDivElement>) => void;
  onMoveSelectedRooms?: (targetUserId: string | null) => void;
  selectedRoomsCount?: number;
  shiftAssignments?: any[];
  isAssigning?: boolean;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  venueId?: number | null;
  roomActions?: HydratedAction[];
}

export default function RoomRow({
  room,
  roomEvents,
  isLastRow,
  showLabel = true,
  isEvenRow = false,
  interactive = false,
  isSelected = false,
  onSelectRoom,
  onMoveSelectedRooms,
  selectedRoomsCount = 0,
  shiftAssignments = [],
  isAssigning = false,
  assignedUserId = null,
  assignedUserName = null,
  venueId = null,
  roomActions = [],
}: RoomRowProps) {
  const rowHeightPx = 90;
  const roomText = room.replace(/^GH\s+/, "");
  const rowHeightStyle = { height: `${rowHeightPx}px` } as const;
  const venueHref =
    !interactive && venueId !== null && venueId !== undefined
      ? `/venues/${venueId}`
      : null;

  const labelBody = showLabel ? (
    <div className="flex flex-col items-center gap-1">
      <Badge
        className={`${isSelected ? "ring-4 ring-blue-500" : ""}`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {roomText}
      </Badge>
      {interactive && assignedUserId ? (
        <UserAvatar
          profile={{ id: assignedUserId, name: assignedUserName ?? assignedUserId } as any}
          size="sm"
          variant="solid"
        />
      ) : null}
    </div>
  ) : null;

  const labelContent = (
    <div
      data-room-label="true"
      style={{
        zIndex: 50,
        ...rowHeightStyle,
      }}
      className={`sticky left-0 w-24 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer event-no-select ${
        isLastRow ? "rounded-bl-md" : ""
      }`}
      onClick={
        interactive && onSelectRoom
          ? (e) => {
              onSelectRoom(room, e);
            }
          : undefined
      }
    >
      {venueHref ? (
        <Link
          href={venueHref}
          className={`flex h-full w-full items-center justify-center focus-visible:outline-none transition-colors ${
            isLastRow ? "rounded-bl-md" : ""
          } hover:bg-primary/15 focus-visible:bg-primary/20 dark:hover:bg-primary/20 dark:focus-visible:bg-primary/25`}
        >
          {labelBody}
        </Link>
      ) : (
        labelBody
      )}
    </div>
  );

  const label = labelContent;

  const stackedActionElements = React.useMemo(() => {
    const totals = new Map<number, number>();
    const indices = new Map<number, number>();

    const getStartKey = (action: HydratedAction) => {
      if (typeof action.derived?.startMinutes === "number") {
        return action.derived.startMinutes;
      }
      const fallback = convertTimeToMinutes(action.startTime);
      if (fallback !== null) {
        return fallback;
      }
      const numericId =
        typeof action.id === "number"
          ? action.id
          : Number.parseInt(String(action.id), 10);
      return Number.isFinite(numericId) ? numericId : 0;
    };

    roomActions.forEach((action) => {
      const key = getStartKey(action);
      totals.set(key, (totals.get(key) ?? 0) + 1);
    });

    return roomActions.map((action) => {
      const key = getStartKey(action);
      const currentIndex = indices.get(key) ?? 0;
      indices.set(key, currentIndex + 1);
      const stackCount = totals.get(key) ?? 1;
      return (
        <RoomRowAction
          key={`action-${action.id}-${currentIndex}`}
          action={action}
          rowHeightPx={rowHeightPx}
          stackIndex={currentIndex}
          stackCount={stackCount}
        />
      );
    });
  }, [roomActions, rowHeightPx]);

  return (
    <div
      className={` flex overflow-visible ${isLastRow ? "rounded-b-md" : ""} ${
        isEvenRow
          ? "bg-muted/10 dark:bg-background"
          : "bg-background/30 dark:bg-muted/30"
      }`}
      style={{
        ...rowHeightStyle,
      }}
    >
      {interactive ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>{label}</ContextMenuTrigger>
          {shiftAssignments && shiftAssignments.length > 0 ? (
            <ContextMenuContent>
              {selectedRoomsCount > 0 ? (
                <>
                  <ContextMenuItem
                    disabled={isAssigning}
                    onClick={() => {
                      onMoveSelectedRooms?.(null);
                    }}
                  >
                    Move {selectedRoomsCount} selected to Unassigned
                  </ContextMenuItem>
                  {shiftAssignments.map((a: any) => (
                    <ContextMenuItem
                      key={a.user}
                      disabled={isAssigning}
                      onClick={() => {
                        onMoveSelectedRooms?.(a.user);
                      }}
                    >
                      Move {selectedRoomsCount} selected to{" "}
                      <UserAvatar
                        profile={{
                          id: a.user,
                          name: a.name ?? a.user,
                        } as any}
                        size="sm"
                        variant="solid"
                      />
                    </ContextMenuItem>
                  ))}
                </>
              ) : (
                <ContextMenuItem disabled>No rooms selected</ContextMenuItem>
              )}
            </ContextMenuContent>
          ) : null}
        </ContextMenu>
      ) : (
        label
      )}

      <div
        className={`flex-1 relative transition-all duration-300 ease-in-out overflow-visible ${
          isLastRow ? "rounded-br-md" : ""
        }`}
        style={{ ...rowHeightStyle }}
      >
        {roomEvents?.map((event: finalEvent) => (
          <Event key={event.id} event={event} rowHeightPx={rowHeightPx} />
        ))}
        {stackedActionElements}
      </div>
    </div>
  );
}
