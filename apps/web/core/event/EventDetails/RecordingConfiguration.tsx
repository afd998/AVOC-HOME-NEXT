"use client";

import Link from "next/link";
import { ExternalLink, Circle } from "lucide-react";
import type { EventRecordingRow } from "shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecordingConfigurationProps {
  recording?: EventRecordingRow | null;
}

export default function RecordingConfiguration({
  recording,
}: RecordingConfigurationProps) {
  const hasRecording = Boolean(recording);

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <div className="flex items-center justify-center rounded-sm bg-muted size-8">
          <Circle
            className={`size-4 fill-red-500 text-red-500 ${
              !hasRecording ? "opacity-40 grayscale" : ""
            }`}
          />
        </div>
        <div className="flex w-full items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold leading-tight">
            Recording
          </CardTitle>
          {hasRecording && (
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="flex items-center gap-2 uppercase tracking-wide"
            >
              <Link
                href="https://kellogg-northwestern.hosted.panopto.com/Panopto/Pages/Sessions/List.aspx#status=%5B2%2C5%5D"
                target="_blank"
                rel="noopener noreferrer"
              >
                Panopto
                <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-normal">
        {recording ? (
          <>
            {recording.type && (
              <div>
                <span className="font-medium">Type: </span>
                {recording.type}
              </div>
            )}
            {recording.instructions && (
              <div>
                <span className="font-medium">Instructions: </span>
                <span className="whitespace-pre-line">
                  {recording.instructions}
                </span>
              </div>
            )}
            {!recording.type && !recording.instructions && (
              <span className="text-muted-foreground">
                No recording details provided
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">No recording</span>
        )}
      </CardContent>
    </Card>
  );
}
