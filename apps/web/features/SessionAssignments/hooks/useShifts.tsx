import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Shift as SharedShift } from "shared";

export type Shift = SharedShift;
export type ShiftInsert = {
  date: string;
  startTime: string | null;
  endTime: string | null;
  profileId: string | null;
};

type ShiftApiRow = {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  profileId: string | null;
  createdAt?: string | null;
};

type ShiftResponse = {
  shifts: ShiftApiRow[];
};

const mapShift = (row: ShiftApiRow): Shift => ({
  id: row.id,
  date: row.date,
  startTime: row.startTime,
  endTime: row.endTime,
  profileId: row.profileId,
  createdAt: row.createdAt ?? null,
});

// Updated to use date instead of week_start
export function useShifts(dates: string | string[] | null) {
  return useQuery({
    queryKey: ['shifts', dates],
    queryFn: async (): Promise<Shift[]> => {
      if (!dates) return [];
      
      // Handle both single date and array of dates
      const dateArray = Array.isArray(dates) ? dates : [dates];
      console.log('Fetching shifts for dates:', dateArray);
      
      const params = dateArray
        .filter(Boolean)
        .map((d) => `date=${encodeURIComponent(d)}`)
        .join('&');
      const url = `/api/assignments/shifts?${params}`;

      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error('Failed to fetch shifts');
      }
      const data: ShiftResponse = await res.json();
      return (data.shifts ?? []).map(mapShift);
    },
    enabled: !!dates && (Array.isArray(dates) ? dates.length > 0 : !!dates),
  });
}




export function useCopyShifts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sourceDate, targetDate }: { sourceDate: string, targetDate: string }) => {
      const res = await fetch('/api/assignments/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceDate, targetDate }),
      });

      if (!res.ok) {
        throw new Error('Failed to copy shifts');
      }

      return [];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shifts', variables.sourceDate] });
      queryClient.invalidateQueries({ queryKey: ['shifts', variables.targetDate] });
      // Also invalidate array-based queries
      queryClient.invalidateQueries({ 
        queryKey: ['shifts'], 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'shifts' && Array.isArray(queryKey[1]);
        }
      });
    },
  });
}

export function useSaveShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shift: ShiftInsert) => {
      if (!shift.profileId || !shift.date) {
        throw new Error("profileId and date are required");
      }

      const res = await fetch("/api/assignments/shifts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shift),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save shift");
      }

      const data: ShiftResponse = await res.json();
      return data.shifts ?? [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shifts", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shift_blocks", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["eventOwnership"] });
    },
  });
}

export function useDeleteShiftsForDate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date: string) => {
      const url = `/api/assignments/shifts?date=${encodeURIComponent(date)}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete shifts');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shifts', variables] });
      // Also invalidate array-based queries
      queryClient.invalidateQueries({ 
        queryKey: ['shifts'], 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'shifts' && Array.isArray(queryKey[1]);
        }
      });
    },
  });
}

// Cleanup function removed; duplication is prevented at the source

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
    onSuccess: (_, variables) => {
      // Invalidate all shift_blocks queries for the week dates
      variables.weekDates.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        queryClient.invalidateQueries({ queryKey: ['shift_blocks', dateString] });
      });
      
      // Invalidate shifts queries
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      
      // Invalidate event ownership queries
      queryClient.invalidateQueries({ queryKey: ['eventOwnership'] });
    },
  });
}
