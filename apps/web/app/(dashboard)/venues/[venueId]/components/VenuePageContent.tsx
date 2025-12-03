"use client";

import { useVenueCalendarQuery } from "@/lib/query";

type VenuePageContentProps = {
  venueId: string;
  date: string;
  filter: string;
  autoHide: boolean;
};

export default function VenuePageContent({
  venueId,
  date,
  filter,
  autoHide,
}: VenuePageContentProps) {
  const { data, isLoading, isError } = useVenueCalendarQuery({
    venueId,
    date,
    filter,
    autoHide,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading venue schedule...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Unable to load this venue right now. Please try again.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 space-y-2">
        <p className="text-lg font-semibold">No data available</p>
        <p className="text-sm text-muted-foreground">This venue has no details to display right now.</p>
      </div>
    );
  }

  const displayName =
    data.room?.name ??
    data.roomName.replace(/^GH\s+/i, "") ??
    data.roomName;
  const roomType = data.room?.type ?? null;
  const roomSubType = data.room?.subType ?? null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground tracking-wide">
            Venue
          </p>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <div className="flex gap-3 text-sm text-muted-foreground">
            {roomType ? <span>• {roomType}</span> : null}
            {roomSubType ? <span>• {roomSubType}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
