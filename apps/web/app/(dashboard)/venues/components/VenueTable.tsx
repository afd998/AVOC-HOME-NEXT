"use client";

import Link from "next/link";
import { useVenuesQuery } from "@/lib/query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
        {data.map((venue) => (
          <TableRow key={venue.id}>
            <TableCell>
              <Link
                href={`/venues/${venue.id}`}
                className="text-primary hover:underline"
              >
                {venue.name}
              </Link>
            </TableCell>
            <TableCell>{venue.type ?? "—"}</TableCell>
            <TableCell>{venue.subType ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
