"use client";

import { useQuery } from "@tanstack/react-query";
import type { finalEvent } from "@/lib/data/calendar/calendar";

export const eventQueryKey = (eventId: string) => ["event", eventId] as const;

type EventResponse = {
  event: finalEvent;
};

async function fetchEvent(eventId: string): Promise<finalEvent> {
  const response = await fetch(`/api/events/${eventId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Event not found");
    }
    throw new Error("Failed to fetch event");
  }

  const data: EventResponse = await response.json();
  return data.event;
}

type UseEventQueryOptions = {
  eventId: string;
};

export function useEventQuery({ eventId }: UseEventQueryOptions) {
  return useQuery({
    queryKey: eventQueryKey(eventId),
    queryFn: () => fetchEvent(eventId),
    enabled: Boolean(eventId),
  });
}

