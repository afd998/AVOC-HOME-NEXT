import { useQuery } from '@tanstack/react-query';

export const useRooms = () => {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch('/api/assignments/shift-blocks?onlyRooms=true', {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data: { rooms?: Array<{ [key: string]: any }> } = await res.json();
      return data.rooms ?? [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - rooms don't change often
  });

  return {
    rooms: rooms || [],
    isLoading,
    error,
  };
}; 


export function useLCRooms() {
  const {rooms, isLoading: roomsLoading} = useRooms();
 
  // Filter rooms for those with type = "LIGHT COURT"
  const lightCourtRooms = rooms?.filter(room => room.type === "LIGHT COURT") || [];
  return { data: lightCourtRooms, isLoading: false };
}
