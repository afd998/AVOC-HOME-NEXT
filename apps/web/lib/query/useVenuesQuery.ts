"use client";

import { useQuery } from "@tanstack/react-query";
import type { VenueRow } from "@/lib/data/venues";

export const venuesQueryKey = ["venues"] as const;

type VenuesResponse = {
  venues: VenueRow[];
};

async function fetchVenues(): Promise<VenueRow[]> {
  const response = await fetch("/api/venues");

  if (!response.ok) {
    throw new Error("Failed to fetch venues");
  }

  const data: VenuesResponse = await response.json();
  return data.venues;
}

export function useVenuesQuery() {
  return useQuery({
    queryKey: venuesQueryKey,
    queryFn: fetchVenues,
    staleTime: 5 * 60 * 1000,
  });
}
