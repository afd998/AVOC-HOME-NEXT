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
}: RoomRowProps) {
  const rowHeightPx = 90;
  const roomText = room.replace(/^GH\s+/, "");
  const rowHeightStyle = { height: `${rowHeightPx}px` } as const;

  const label = (
    <div
      data-room-label="true"
      style={{
        zIndex: 60,
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
      {showLabel ? (
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
      ) : null}
    </div>
  );

  return (
    <div
      className={` flex overflow-visible ${isLastRow ? "rounded-b-md" : ""} ${
        isEvenRow
          ? "bg-muted/80 dark:bg-muted/80"
          : "bg-muted/5 dark:bg-muted/100"
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
      </div>
    </div>
  );
}
