"use client";

import Link from "next/link";
import { useVenuesQuery } from "@/lib/query";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_BADGE = "bg-muted text-muted-foreground border-transparent";

function getBadgeDisplay(value?: string | null) {
  const label = value?.trim();
  if (!label) {
    return { label: "N/A", className: `font-normal ${FALLBACK_BADGE}` };
  }

  const hash = label
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  // Generate a deterministic color per label; keep alpha low so it stays muted in dark mode.
  const bg = `hsl(${hue} 70% 45% / 0.24)`;
  const border = `hsl(${hue} 75% 45% / 0.5)`;
  const text = `hsl(${hue} 100% 35%)`;

  return {
    label,
    className: "font-normal border backdrop-blur-[1px]",
    style: { backgroundColor: bg, borderColor: border, color: text },
  };
}

export default function VenueTable() {
  const { data, isLoading, isError } = useVenuesQuery();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Unable to load venues right now. Please try again later.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Subtype</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((venue) => {
          const typeBadge = getBadgeDisplay(venue.type);
          const subTypeBadge = getBadgeDisplay(venue.subType);

          return (
            <TableRow key={venue.id}>
              <TableCell>
                <Link
                  href={`/venues/${venue.id}`}
                  className="text-primary hover:underline"
                >
                  {venue.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={typeBadge.className}
                  style={typeBadge.style}
                >
                  {typeBadge.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={subTypeBadge.className}
                  style={subTypeBadge.style}
                >
                  {subTypeBadge.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
