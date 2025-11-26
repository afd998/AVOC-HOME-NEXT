"use client";

import type { EventHybridRow } from "shared/db/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HybridConfigurationProps {
  hybrid?: EventHybridRow | null;
}

export default function HybridConfiguration({
  hybrid,
}: HybridConfigurationProps) {
  const normalizeConfig = (config?: string | null) => {
    if (!config) return undefined;
    const value = config.toLowerCase();
    if (value.includes("both")) return "both";
    if (value.includes("presenter")) return "presenter";
    if (value.includes("aud")) return "audience";
    return undefined;
  };

  const configValue = normalizeConfig(hybrid?.config);

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="flex items-center justify-center rounded-sm bg-muted size-8">
          <img
            src="/images/zoomicon.png"
            alt="Zoom"
            className={`size-4 ${!hybrid ? "opacity-40 grayscale" : ""}`}
          />
        </div>
        <CardTitle className="text-sm font-semibold leading-tight">Hybrid</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-normal">
        {hybrid ? (
          <>
            {hybrid.meetingId && (
              <div>
                <span className="font-medium">Meeting ID: </span>
                {(() => {
                  const meetingHref =
                    hybrid.meetingLink ??
                    (hybrid.meetingId
                      ? `https://northwestern.zoom.us/j/${hybrid.meetingId}`
                      : undefined);
                  return meetingHref ? (
                    <a
                      href={meetingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {hybrid.meetingId}
                    </a>
                  ) : (
                    hybrid.meetingId
                  );
                })()}
              </div>
            )}
            <div>
              <span className="font-medium">Instructions: </span>
              <span className="whitespace-pre-line">
                {hybrid.instructions ?? "None"}
              </span>
            </div>
            <div className="space-y-1">
              <Select
                value={configValue ?? undefined}
                onValueChange={() => {}}
                disabled
                aria-readonly
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presenter">Remote Presenter</SelectItem>
                  <SelectItem value="audience">Remote Audience</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!hybrid.meetingLink &&
              !hybrid.meetingId &&
              !hybrid.instructions &&
              !hybrid.config && (
                <span className="text-muted-foreground">
                  No hybrid configuration
                </span>
              )}
          </>
        ) : (
          <span className="text-muted-foreground">No hybrid configuration</span>
        )}
      </CardContent>
    </Card>
  );
}
