import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ShiftBlockWithAssignments,
  ShiftBlock as SharedShiftBlock,
  ShiftBlockAssignment,
} from "shared";

export type ShiftBlock = ShiftBlockWithAssignments;
export type ShiftBlockInsert = Pick<SharedShiftBlock, "date" | "startTime" | "endTime"> & {
  assignments?: unknown;
};

export type Shift = {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  profile_id: string | null;
  created_at?: string | null;
};

type ShiftBlockApiRow = {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  assignments?: ShiftBlockAssignment[];
  createdAt?: string | null;
  shiftBlockProfileRooms?: Array<{
    profile?: { id: string; name?: string | null } | null;
    room?: { name?: string | null } | null;
  }>;
};

type ShiftBlockResponse = {
  shiftBlocks: ShiftBlockApiRow[];
  rooms?: { name: string | null }[];
};

const normalizeAssignments = (block: ShiftBlockApiRow): ShiftBlockAssignment[] => {
  // Build assignments from relations when the API response doesn't include them directly
  if (Array.isArray(block.shiftBlockProfileRooms)) {
    const grouped = new Map<string, ShiftBlockAssignment>();
    block.shiftBlockProfileRooms.forEach((rel) => {
      const profileId = rel.profile?.id;
      if (!profileId) return;
      const entry =
        grouped.get(profileId) ??
        ({
          user: profileId,
          name: rel.profile?.name ?? profileId,
          rooms: [],
          profile: rel.profile ?? {
            id: profileId,
            name: rel.profile?.name ?? profileId,
          },
        } as ShiftBlockAssignment);
      const roomName = rel.room?.name;
      if (roomName) entry.rooms.push(roomName);
      grouped.set(profileId, entry);
    });
    return Array.from(grouped.values());
  }

  return [];
};

const mapShiftBlock = (block: ShiftBlockApiRow): ShiftBlock => ({
  id: block.id,
  date: block.date,
  startTime: block.startTime,
  endTime: block.endTime,
  assignments: Array.isArray(block.assignments)
    ? block.assignments
    : normalizeAssignments(block),
  createdAt: block.createdAt ?? null,
});


export function useShiftBlocks(date: string | null) {
  return useQuery({
    queryKey: ['shift_blocks', date],
    queryFn: async (): Promise<ShiftBlock[]> => {
      const url = date
        ? `/api/assignments/shift-blocks?date=${encodeURIComponent(date)}`
        : '/api/assignments/shift-blocks';

      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error('Failed to fetch shift blocks');
      }
      const data: ShiftBlockResponse = await res.json();
      const blocks = (data.shiftBlocks ?? []).map(mapShiftBlock);
      if (typeof window !== 'undefined') {
        console.log('[useShiftBlocks] fetched', blocks.length, 'blocks', blocks);
      }
      return blocks;
    },
    staleTime: Infinity, // Data never becomes stale - only invalidated on page refresh
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}







export function useUpdateShiftBlocks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ date, newBlocks }: { date: string, newBlocks: ShiftBlockInsert[] }) => {
      console.log('🔄 Updating shift blocks for date:', date);
      console.log('  📅 Date:', date);
      console.log('  📦 New blocks:', newBlocks.length);
      
      // Insert new blocks
      if (newBlocks.length > 0) {
        // Filter out any zero-duration blocks before inserting
        const validBlocks = newBlocks.filter(block => {
          if (block.startTime === block.endTime) {
            console.error(`🚨 ERROR: Attempting to insert zero-duration block: ${block.startTime} -> ${block.endTime}`);
            return false;
          }
          return true;
        });
        
        console.log(`🔍 Filtered ${newBlocks.length - validBlocks.length} zero-duration blocks`);
        console.log('🔍 Valid blocks to insert:', validBlocks.map(b => ({ start: b.startTime, end: b.endTime })));

        const res = await fetch('/api/assignments/shift-blocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, newBlocks: validBlocks }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('❌ Error inserting new blocks:', text);
          throw new Error('Failed to update shift blocks');
        }

        const data: ShiftBlockResponse = await res.json();
        console.log('✅ Successfully inserted', data.shiftBlocks?.length, 'new blocks');
        return (data.shiftBlocks ?? []).map(mapShiftBlock);
      }
      
      return [];
    },
    onSuccess: async (data, variables) => {
      // First, refetch the shift blocks to ensure they're updated
      await queryClient.refetchQueries({ queryKey: ['shift_blocks', variables.date] });
      await queryClient.refetchQueries({ queryKey: ['shift_blocks'] });
      
      // Then invalidate event ownership queries so they use the updated shift blocks
      queryClient.invalidateQueries({ queryKey: ['eventOwnership'] });
    },
  });
}

// Mutation for assigning a set of rooms to a specific profile (or unassigning) within a shift block
export function useAssignRoomsToShiftBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shiftBlockId,
      roomNames,
      targetUserId,
    }: {
      shiftBlockId: number | string;
      roomNames: string[];
      targetUserId: string | null;
      date?: string | null;
    }) => {
      if (!shiftBlockId && shiftBlockId !== 0) {
        console.error("[useAssignRoomsToShiftBlock] missing shiftBlockId", {
          shiftBlockId,
          roomNames,
          targetUserId,
        });
        throw new Error("Missing shift block id");
      }

      const res = await fetch(`/api/assignments/shift-blocks/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftBlockId, roomNames, targetUserId }),
      });

      if (!res.ok) {
        let message = "Failed to assign rooms to shift block";
        try {
          const err = await res.json();
          console.error("[useAssignRoomsToShiftBlock] response error", err);
          message = `${res.status} ${err?.error ?? message}${
            err?.details ? ` (${err.details})` : ""
          }${err?.rawId ? ` rawId=${err.rawId}` : ""}${
            typeof err?.parsed !== "undefined" ? ` parsed=${err.parsed}` : ""
          }`;
        } catch {
          const text = await res.text().catch(() => "");
          message = text || message;
        }
        console.error("[useAssignRoomsToShiftBlock] error", message);
        throw new Error(message);
      }

      const data: { shiftBlock?: ShiftBlockApiRow | null } = await res.json();
      return data.shiftBlock ? mapShiftBlock(data.shiftBlock as ShiftBlockApiRow) : null;
    },
    onSuccess: async (data, variables) => {
      const dateParam = variables.date ?? null;
      await queryClient.refetchQueries({ queryKey: ["shift_blocks", dateParam] });
      await queryClient.refetchQueries({ queryKey: ["shift_blocks"] });
      queryClient.invalidateQueries({ queryKey: ["eventOwnership"] });
      // Ensure Actions panel (actionpanel queries) picks up latest assignments
      queryClient.invalidateQueries({ queryKey: ["actionpanel"] });
    },
  });
}



// Mutation for copying schedule from previous week
export function useCopyScheduleFromPreviousWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ weekDates, previousWeekStartDate }: { 
      weekDates: Date[], 
      previousWeekStartDate: Date 
    }) => {
      const weekDateStrings = weekDates.map((d) => d.toISOString().split('T')[0]);
      const res = await fetch('/api/assignments/shift-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekDates: weekDateStrings,
          previousWeekStartDate: previousWeekStartDate.toISOString().split('T')[0],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to copy schedule from previous week');
      }
    },
    onSuccess: async (_, variables) => {
      // First, refetch all shift_blocks queries for the week dates
      for (const date of variables.weekDates) {
        const dateString = date.toISOString().split('T')[0];
        await queryClient.refetchQueries({ queryKey: ['shift_blocks', dateString] });
      }
      
      // Refetch shifts queries
      await queryClient.refetchQueries({ queryKey: ['shifts'] });
      
      // Then invalidate event ownership queries so they use the updated shift blocks
      queryClient.invalidateQueries({ queryKey: ['eventOwnership'] });
    },
  });
}

// Hook to check if all rooms are assigned in shift blocks for a given date
export function useAllRoomsAssigned(date: string | null) {
  return useQuery({
    queryKey: ['allRoomsAssigned', date],
    queryFn: async (): Promise<boolean> => {
      if (!date) return false;

      const url = `/api/assignments/shift-blocks?date=${encodeURIComponent(
        date
      )}&includeRooms=true`;

      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error('Failed to load rooms/shift blocks');
      }

      const data: ShiftBlockResponse = await res.json();
      const allRoomNames = (data.rooms ?? [])
        .map((room) => room.name)
        .filter((name): name is string => Boolean(name));
      
      if (allRoomNames.length === 0) return false;

      const shiftBlocks =
        data.shiftBlocks?.map(mapShiftBlock).filter((b) => b.date === date) ??
        [];
      if (shiftBlocks.length === 0) return false;

      // Collect all assigned rooms from all shift blocks
      const assignedRooms = new Set<string>();
      
      shiftBlocks.forEach(block => {
        if (block.assignments && Array.isArray(block.assignments)) {
          block.assignments.forEach((assignment: any) => {
            if (assignment.rooms && Array.isArray(assignment.rooms)) {
              assignment.rooms.forEach((room: string) => {
                assignedRooms.add(room);
              });
            }
          });
        }
      });

      // Check if all rooms are assigned
      return allRoomNames.every(roomName => assignedRooms.has(roomName));
    },
    enabled: !!date,
    staleTime: 30 * 1000, // 30 seconds
  });
}
