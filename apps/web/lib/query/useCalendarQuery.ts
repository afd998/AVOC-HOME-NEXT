"use client";

import { useQuery } from "@tanstack/react-query";
import type { RoomRowData } from "@/lib/data/calendar/calendar";

export const calendarQueryKey = (
  date: string,
  filter: string,
  autoHide: boolean
) => ["calendar", date, filter, autoHide] as const;

type CalendarResponse = {
  calendar: RoomRowData[];
};

async function fetchCalendar(
  date: string,
  filter: string,
  autoHide: boolean
): Promise<RoomRowData[]> {
  const params = new URLSearchParams({
    filter,
    autoHide: autoHide ? "true" : "false",
  });

  const response = await fetch(`/api/calendar/${date}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch calendar");
  }

  const data: CalendarResponse = await response.json();
  return data.calendar;
}

type UseCalendarQueryOptions = {
  date: string;
  filter: string;
  autoHide: boolean;
};

export function useCalendarQuery({
  date,
  filter,
  autoHide,
}: UseCalendarQueryOptions) {
  return useQuery({
    queryKey: calendarQueryKey(date, filter, autoHide),
    queryFn: () => fetchCalendar(date, filter, autoHide),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

