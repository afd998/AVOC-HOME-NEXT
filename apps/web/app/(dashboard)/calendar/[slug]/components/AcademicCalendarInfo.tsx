"use client"
import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAcademicCalendar } from '@/ref/useAcademicCalendar';

const AcademicCalendarInfo: React.FC = () => {
  const { slug } = useParams<{ slug?: string | string[] }>();

  const selectedDate = React.useMemo(() => {
    const dateParam = Array.isArray(slug) ? slug[0] : slug;

    if (!dateParam) {
      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0
      );
    }

    const [year, month, day] = dateParam.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day, 12, 0, 0);

    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }, [slug]);

  const { data: calendarItems = [], error } = useAcademicCalendar(selectedDate);

  if (error) {
    return (
      <Badge variant="destructive" className="text-xs">
        Error: {error.message || 'Failed to fetch academic calendar'}
      </Badge>
    );
  }

  if (calendarItems.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant="default" 
          className="text-xs font-medium cursor-pointer hover:scale-105 transition-all duration-300 flex items-center gap-1"
        >
          <GraduationCap className="w-3 h-3" />
          {calendarItems.length} item{calendarItems.length !== 1 ? 's' : ''}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Academic Calendar</h4>
          <div className="space-y-1">
            {calendarItems.map((item:any) => (
              <div key={item.id} className="text-sm">
                {item.label || 'No label'}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AcademicCalendarInfo; 
