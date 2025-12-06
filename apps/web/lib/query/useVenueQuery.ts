"use client";

import { useQuery } from "@tanstack/react-query";
import type { VenueRow } from "@/lib/data/venues";

type VenueResponse = {
  venue: VenueRow;
};

async function fetchVenue(venueId: string): Promise<VenueRow> {
  const response = await fetch(`/api/venues/${venueId}/details`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Venue not found");
    }
    throw new Error("Failed to fetch venue");
  }

  const data: VenueResponse = await response.json();
  return data.venue;
}

type UseVenueQueryOptions = {
  venueId: string;
};

export function useVenueQuery({ venueId }: UseVenueQueryOptions) {
  const queryKey = ["venue", venueId] as const;

  return useQuery({
    queryKey,
    queryFn: () => fetchVenue(venueId),
    enabled: Boolean(venueId),
    staleTime: 5 * 60 * 1000,
  });
}
