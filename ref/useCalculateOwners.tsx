import { useQuery } from '@tanstack/react-query';
import { useUserProfile } from '../core/User/useUserProfile';
import { useUserProfiles } from '../core/User/useUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { updateEventInCache } from '../app/(dashboard)/calendar/Schedule/hooks/useEvents';
import { notifyEventAssignment } from '../../../utils/notificationUtils';
import { useShiftBlocks } from '../features/SessionAssignments/hooks/useShiftBlocks';
import { useEvent } from '../../event/hooks/useEvent';
import type { Database } from '../../../types/supabase';

type Event = Database['public']['Tables']['events']['Row'];
type ShiftBlock = Database['public']['Tables']['shift_blocks']['Row'];

// Base data structure for intersecting shift blocks
interface IntersectingBlock {
  blockId: number;
  startTime: string;
  endTime: string;
  owners: string[];
}

// Processed ownership data
interface OwnershipData {
  owners: string[];
  handOffTimes: string[];
}

// Timeline entry for ownership display
interface OwnershipTimelineEntry {
  ownerId: string;
  transitionTime?: string; // undefined for the last owner
}



// Main hook to get ownership data for an event
export function useEventOwnership(eventId: number | null) {
  // Fetch the event data using the useEvent hook
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  
  // Use the existing useShiftBlocks hook instead of direct Supabase call
  const { data: shiftBlocks = [], isLoading: shiftBlocksLoading, error: shiftBlocksError } = useShiftBlocks(event?.date || null);
  
  return useQuery({
    queryKey: ['eventOwnership', eventId],
    queryFn: async () => {
      if (!event?.date) return null;
      
      // If shift blocks are still loading or there was an error, return null
      if (shiftBlocksLoading || shiftBlocksError) {
        return null;
      }
      
      // Get intersecting blocks
      const intersectingBlocks = getIntersectingBlocks(event, shiftBlocks);
      // Process ownership data
      const ownershipData = processOwnershipData(intersectingBlocks);
       
      // Create timeline for display
      const timeline = createOwnershipTimeline(ownershipData.owners, ownershipData.handOffTimes, event.man_owner);
           
      return {
        intersectingBlocks,
        ...ownershipData,
        timeline
      };
    },
  
    staleTime: Infinity, // Data never becomes stale - only invalidated on page refresh
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    refetchOnMount: true, // Allow refetching when component mounts
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}



// Mutation for assigning manual owner
export function useAssignManualOwner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: number; userId: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ man_owner: userId })
        .eq('id', eventId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (updatedEvent) => {
      // Update the individual event cache
      queryClient.setQueryData(['event', updatedEvent.id], updatedEvent);
      
      // Update the specific date-based events query to avoid full refetch
      const dateString = updatedEvent.date;
      const existingEvents = queryClient.getQueryData(['events', dateString]) as Event[];
      if (existingEvents) {
        const updatedEvents = existingEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        );
        queryClient.setQueryData(['events', dateString], updatedEvents);
      }

      // Invalidate event ownership queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['eventOwnership', updatedEvent.id] });

      // Send notification to the assigned user
      try {
        await notifyEventAssignment(
          updatedEvent.id,
          updatedEvent.man_owner!,
          updatedEvent.event_name || 'Event'
        );
      } catch (error) {
        console.error('Failed to send event assignment notification:', error);
      }
    },
  });
}

// Mutation for clearing manual owner
export function useClearManualOwner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId }: { eventId: number }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ man_owner: null })
        .eq('id', eventId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedEvent) => {
      // Update the individual event cache
      queryClient.setQueryData(['event', updatedEvent.id], updatedEvent);
      
      // Update the specific date-based events query to avoid full refetch
      const dateString = updatedEvent.date;
      const existingEvents = queryClient.getQueryData(['events', dateString]) as Event[];
      if (existingEvents) {
        const updatedEvents = existingEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        );
        queryClient.setQueryData(['events', dateString], updatedEvents);
      }

      // Invalidate event ownership queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['eventOwnership', updatedEvent.id] });
    },
  });
} 