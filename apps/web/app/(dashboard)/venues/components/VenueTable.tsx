"use client";

import * as React from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const FALLBACK_BADGE = "bg-muted text-muted-foreground border-transparent";

const BUILDING_TABS = [
  { label: "Global HUB", value: "GLOBAL HUB" },
  { label: "KEC", value: "KEC" },
] as const;

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
  const [selectedBuilding, setSelectedBuilding] = React.useState(
    BUILDING_TABS[0]?.value ?? "GLOBAL HUB"
  );
  const [searchTerm, setSearchTerm] = React.useState("");

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

  const renderTable = (building: string) => {
    const filtered = data.filter((venue) => {
      const matchesBuilding = venue.building?.toUpperCase() === building;
      const matchesSearch = venue.name
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      return matchesBuilding && matchesSearch;
    });

    return (
      <div className="flex h-full flex-col overflow-hidden rounded-md border">
        <div className="flex-1 overflow-y-auto">
          <Table className="relative">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 z-10 bg-background">Name</TableHead>
                <TableHead className="sticky top-0 z-10 bg-background">Type</TableHead>
                <TableHead className="sticky top-0 z-10 bg-background">Subtype</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No venues found for this building / search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((venue) => {
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
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Tabs
      value={selectedBuilding}
      onValueChange={setSelectedBuilding}
      className="flex h-[70vh] flex-col space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          {BUILDING_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search venue name..."
          className="sm:max-w-xs"
        />
      </div>

      {BUILDING_TABS.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="mt-0 flex-1 overflow-hidden"
        >
          {renderTable(tab.value)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
