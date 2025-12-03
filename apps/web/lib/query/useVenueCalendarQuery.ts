"use client";

import { useQuery } from "@tanstack/react-query";
import type { RoomRowData } from "@/lib/data/calendar/calendar";

export const venueCalendarQueryKey = (
  venueId: string,
  date: string,
  filter: string,
  autoHide: boolean
) => ["venue-calendar", venueId, date, filter, autoHide] as const;

type VenueCalendarResponse = {
  row: RoomRowData | null;
};

async function fetchVenueCalendar(
  venueId: string,
  date: string,
  filter: string,
  autoHide: boolean
): Promise<RoomRowData | null> {
  const params = new URLSearchParams({
    date,
    filter,
    autoHide: autoHide ? "true" : "false",
  });

  const response = await fetch(`/api/venues/${venueId}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch venue calendar");
  }

  const data: VenueCalendarResponse = await response.json();
  return data.row;
}

type UseVenueCalendarQueryOptions = {
  venueId: string;
  date: string;
  filter?: string;
  autoHide?: boolean;
};

export function useVenueCalendarQuery({
  venueId,
  date,
  filter = "All Rooms",
  autoHide = false,
}: UseVenueCalendarQueryOptions) {
  return useQuery({
    queryKey: venueCalendarQueryKey(venueId, date, filter, autoHide),
    queryFn: () => fetchVenueCalendar(venueId, date, filter, autoHide),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
