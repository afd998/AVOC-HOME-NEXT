import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Shift as SharedShift } from "shared";

// Local input using camelCase to match the rest of the UI and API
type ShiftInsertInput = {
  profileId: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
};

export type Shift = SharedShift;

export function useUpdateShift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shift: ShiftInsertInput) => {
      if (!shift.profileId || !shift.date) {
        throw new Error('profileId and date are required');
      }

      const res = await fetch('/api/assignments/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save shift');
      }

      return await res.json();
    },
    onSuccess: async (data, variables) => {
      console.log('Shift mutation success, invalidating queries for date:', variables.date);
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      await queryClient.invalidateQueries({ queryKey: ['shift_blocks', variables.date] });
      await queryClient.invalidateQueries({ queryKey: ['eventOwnership'] });
    },
  });
}
