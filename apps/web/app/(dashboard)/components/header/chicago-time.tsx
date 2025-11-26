'use client';

import {
  RelativeTime,
  RelativeTimeZone,
  RelativeTimeZoneDate,
  RelativeTimeZoneDisplay,
  RelativeTimeZoneLabel,
} from '@/components/ui/shadcn-io/relative-time';

const ChicagoTime = () => (
  <div className="rounded-md border bg-background px-3 py-1 text-xs leading-tight">
    <RelativeTime>
      <RelativeTimeZone zone="America/Chicago">
        <RelativeTimeZoneLabel>Chicago</RelativeTimeZoneLabel>
        <RelativeTimeZoneDate />
        <RelativeTimeZoneDisplay />
      </RelativeTimeZone>
    </RelativeTime>
  </div>
);

export default ChicagoTime;
