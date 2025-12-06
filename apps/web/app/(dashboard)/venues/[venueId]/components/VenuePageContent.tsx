"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import { useVenueQuery } from "@/lib/query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type VenuePageContentProps = {
  venueId: string;
};

export default function VenuePageContent({
  venueId,
}: VenuePageContentProps) {
  const {
    data: venue,
    isLoading,
    isError,
  } = useVenueQuery({ venueId });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading venue...</p>
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Unable to load this venue right now. Please try again.
        </p>
      </div>
    );
  }

  const displayName =
    venue.name ??
    venue.spelling ??
    "Unknown room";
  const building = venue.building ?? "GLOBAL HUB";
  const roomType = venue.type ?? null;
  const roomSubType = venue.subType ?? null;
  const devices: { name: string; type?: string | null; status?: string | null }[] =
    [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-normal gap-1">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <span>{building}</span>
            </Badge>
            {roomType ? (
              <Badge variant="outline" className="font-normal">
                {roomType}
              </Badge>
            ) : null}
            {roomSubType ? (
              <Badge variant="outline" className="font-normal">
                {roomSubType}
              </Badge>
            ) : null}
          </div>
        </div>
        <Button className="flex items-center gap-2 bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200">
          <Image
            src="/images/crestron_swirl_blue_cmyk.png"
            alt="Crestron"
            width={24}
            height={24}
            className="h-6 w-6 rounded-sm object-contain"
          />
          <span>XPanel</span>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>SNMP Traps</CardTitle>
            <CardDescription>Trap destinations configured for this venue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/20 text-sm text-muted-foreground">
              No SNMP traps have been added for this venue yet.
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Inventory of devices in this venue.</CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.name}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.type ?? "—"}</TableCell>
                      <TableCell>{device.status ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/20 text-sm text-muted-foreground">
                No devices recorded for this venue yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
