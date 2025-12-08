import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type AcademicCalendarItem = {
  id: string | number;
  label?: string | null;
  date?: string | null;
};

const fetchAcademicCalendar = async (date: Date): Promise<AcademicCalendarItem[]> => {
  // Create start and end of day in UTC to match database storage
  const startOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));

  const { data, error } = await supabase
    .from('academic_calendar')
    .select('*')
    .gte('date', startOfDay.toISOString())
    .lte('date', endOfDay.toISOString());

  if (error) {
    throw error;
  }

  return data || [];
};

export const useAcademicCalendar = (date: Date) => {
  return useQuery({
    queryKey: ['academic-calendar', date.toISOString().split('T')[0]],
    queryFn: () => fetchAcademicCalendar(date),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!date, // Only run query if date is provided
  });
}; 
