"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { EventRecordingRow } from "shared/db/types";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RecordingIcon } from "../event-configuration/icons";

interface RecordingConfigurationProps {
  recording?: EventRecordingRow | null;
}

export default function RecordingConfiguration({
  recording,
}: RecordingConfigurationProps) {
  const hasRecording = Boolean(recording);

  return (
    <Item variant="outline" size="sm" className="flex-1 items-start">
      <ItemMedia variant="icon">
        <RecordingIcon muted={!hasRecording} />
      </ItemMedia>
      <ItemContent className="gap-2">
        <div className="flex w-full items-center justify-between gap-3">
          <ItemTitle className="text-sm font-semibold leading-tight">
            Recording
          </ItemTitle>
          {hasRecording && (
            <ItemActions>
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
            </ItemActions>
          )}
        </div>
        <ItemDescription asChild>
          <div className="space-y-2 text-sm leading-normal">
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
          </div>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
