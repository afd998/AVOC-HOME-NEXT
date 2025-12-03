"use client";

import React from "react";
import RoomRow from "@/app/(dashboard)/calendar/[slug]/components/RoomRow";
import { RoomRowData, finalEvent } from "@/lib/data/calendar/calendar";
import { useEventAssignmentsStore } from "@/lib/stores/event-assignments";
import {
  useAssignRoomsToShiftBlock,
  useShiftBlocks,
} from "@/features/SessionAssignments/hooks/useShiftBlocks";

interface RoomRowsProps {
  calendar: RoomRowData[];
  dateString: string;
}

export default function RoomRows({ calendar, dateString }: RoomRowsProps) {
  const {
    showEventAssignments,
    selectedShiftBlock,
    setSelectedShiftBlock,
    setSelectedShiftBlockId,
    setSelectedShiftBlockIndex,
  } = useEventAssignmentsStore();

  const [selectedRoomsSet, setSelectedRoomsSet] = React.useState<Set<string>>(
    new Set()
  );
  const [lastSelectedRoom, setLastSelectedRoom] = React.useState<string | null>(
    null
  );

  const { data: shiftBlocks = [] } = useShiftBlocks(dateString);
  const assignRoomsToShiftBlock = useAssignRoomsToShiftBlock();
  const isAssigning = assignRoomsToShiftBlock.isPending;

  const labelRoomOrder = React.useMemo(
    () => calendar.map((r) => r.roomName),
    [calendar]
  );

  const isRoomSelected = React.useCallback(
    (roomName: string) => selectedRoomsSet.has(roomName),
    [selectedRoomsSet]
  );

  const selectRoomLabel = React.useCallback(
    (roomName: string, event: React.MouseEvent<HTMLDivElement>) => {
      if (!showEventAssignments) return;

      setSelectedRoomsSet((prev) => {
        if (event.shiftKey && lastSelectedRoom) {
          const lastIndex = labelRoomOrder.indexOf(lastSelectedRoom);
          const currentIndex = labelRoomOrder.indexOf(roomName);
          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeRooms = labelRoomOrder.slice(start, end + 1);
            const next = new Set(prev);
            rangeRooms.forEach((r) => next.add(r));
            return next;
          }
        } else if (event.ctrlKey || event.metaKey) {
          const next = new Set(prev);
          if (next.has(roomName)) {
            next.delete(roomName);
          } else {
            next.add(roomName);
          }
          return next;
        }

        return new Set([roomName]);
      });
      setLastSelectedRoom(roomName);
    },
    [showEventAssignments, lastSelectedRoom, labelRoomOrder]
  );

  const clearSelection = React.useCallback(() => {
    setSelectedRoomsSet(new Set());
    setLastSelectedRoom(null);
  }, []);

  const handleMoveSelectedRooms = React.useCallback(
    (targetUserId: string | null) => {
      if (
        !showEventAssignments ||
        !selectedShiftBlock ||
        !selectedShiftBlock.id ||
        selectedRoomsSet.size === 0
      ) {
        return;
      }

      console.log("[RoomRows] moveSelectedRooms", {
        shiftBlockId: selectedShiftBlock.id,
        targetUserId,
        rooms: Array.from(selectedRoomsSet),
      });

      const roomNames = Array.from(selectedRoomsSet);

      assignRoomsToShiftBlock.mutate(
        {
          shiftBlockId: selectedShiftBlock.id,
          roomNames,
          targetUserId,
          date: dateString,
        },
        {
          onSuccess: (updatedBlock) => {
            clearSelection();
            if (updatedBlock) {
              setSelectedShiftBlockId(updatedBlock.id.toString());
              setSelectedShiftBlock(updatedBlock);
              const matchIndex = shiftBlocks.findIndex(
                (block: any) => block.id === updatedBlock.id
              );
              setSelectedShiftBlockIndex(
                matchIndex >= 0 ? matchIndex : null
              );
            }
          },
        }
      );
    },
    [
      showEventAssignments,
      selectedShiftBlock,
      selectedRoomsSet,
      shiftBlocks,
      assignRoomsToShiftBlock,
      dateString,
      clearSelection,
      setSelectedShiftBlockId,
      setSelectedShiftBlock,
      setSelectedShiftBlockIndex,
    ]
  );

  React.useEffect(() => {
    if (!showEventAssignments) {
      clearSelection();
    }
  }, [showEventAssignments, clearSelection]);

  const shiftAssignments: any[] = Array.isArray(
    (selectedShiftBlock as any)?.assignments
  )
    ? (selectedShiftBlock as any).assignments
    : [];

  return (
    <div>
      {calendar.map(
        (
          {
            roomName,
            events,
            venueId,
          }: { roomName: string; events: finalEvent[]; venueId: number | null },
          index: number
        ) => {
          const assignedEntry = shiftAssignments.find(
            (a: any) => Array.isArray(a?.rooms) && a.rooms.includes(roomName)
          );
          return (
            <RoomRow
              key={`${roomName}`}
              room={roomName}
              roomEvents={events}
              isEvenRow={index % 2 === 0}
              isLastRow={index === calendar.length - 1}
              showLabel
              interactive={showEventAssignments}
              isSelected={isRoomSelected(roomName)}
              onSelectRoom={selectRoomLabel}
              onMoveSelectedRooms={handleMoveSelectedRooms}
              selectedRoomsCount={selectedRoomsSet.size}
              shiftAssignments={shiftAssignments}
              isAssigning={isAssigning}
              assignedUserId={assignedEntry?.user ?? null}
              assignedUserName={assignedEntry?.name ?? null}
              venueId={venueId}
            />
          );
        }
      )}
    </div>
  );
}
