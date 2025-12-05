"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import type { EventHybridRow } from "shared/db/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useEventConfiguration } from "./EventConfigurationContext";

interface HybridConfigurationProps {
  hybrid?: EventHybridRow | null;
}

export default function HybridConfiguration({
  hybrid,
}: HybridConfigurationProps) {
  const { isEditable, onUpdate } = useEventConfiguration();
  const [isUpdating, setIsUpdating] = useState(false);

  const normalizeConfig = (config?: string | null) => {
    if (!config) return undefined;
    const value = config.toLowerCase();
    if (value.includes("both")) return "both";
    if (value.includes("presenter")) return "presenter";
    if (value.includes("aud")) return "audience";
    return undefined;
  };

  const configValue = normalizeConfig(hybrid?.config);

  const handleToggleHybrid = async (pressed: boolean) => {
    if (!isEditable || isUpdating) return;
    
    setIsUpdating(true);
    try {
      if (pressed) {
        // Turn on: create with default "both" config
        await onUpdate({ hybrid: { config: "both" } });
      } else {
        // Turn off: set config to null
        await onUpdate({ hybrid: { config: null } });
      }
    } catch (error) {
      console.error("[HybridConfiguration] Failed to toggle hybrid", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfigChange = async (value: string) => {
    if (!isEditable || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onUpdate({ hybrid: { config: value } });
    } catch (error) {
      console.error("[HybridConfiguration] Failed to update hybrid config", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isHybridOn = Boolean(hybrid);

  return (
    <Card className={cn(
      "flex-1",
      isHybridOn && "border-blue-300 dark:border-blue-700"
    )}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="w-fit">
          <Toggle
            variant="outline"
            pressed={isHybridOn}
            onPressedChange={handleToggleHybrid}
            disabled={!isEditable || isUpdating}
            className={cn(
              "h-auto px-3 py-2 rounded-sm transition-colors w-auto inline-flex",
              isEditable && !isUpdating && "cursor-pointer",
              (!isEditable || isUpdating) && "cursor-not-allowed",
              isHybridOn 
                ? "bg-blue-100 hover:bg-blue-200 border-blue-300 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-900 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-700 dark:data-[state=on]:bg-blue-900/30" 
                : "bg-muted hover:bg-accent/50 hover:border-border"
            )}
            aria-label={isHybridOn ? "Disable hybrid" : "Enable hybrid"}
          >
            <img
              src="/images/zoomicon.png"
              alt="Zoom"
              className={`size-4 transition-all ${!isHybridOn ? "opacity-40 grayscale" : ""}`}
            />
            <span className="text-sm font-semibold leading-tight">Hybrid</span>
          </Toggle>
        </div>
        {isHybridOn ? (
          <div className="text-sm">
            <span className="font-medium">Meeting ID: </span>
            {hybrid?.meetingId ? (
              (() => {
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
              })()
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-normal">
        {hybrid ? (
          <>
            <div className="space-y-1">
              <Select
                value={configValue ?? undefined}
                disabled={!isEditable || isUpdating}
                onValueChange={handleConfigChange}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presenter">
                    <div className="flex items-center gap-2">
                      <Icon icon="streamline-ultimate:meeting-remote" width={16} height={16} />
                      <span>Remote Presenter</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audience">
                    <div className="flex items-center gap-2">
                      <Icon icon="streamline-ultimate:work-from-home-laptop-meeting-bold" width={16} height={16} />
                      <span>Remote Audience</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Icon icon="streamline-ultimate:work-from-home-laptop-meeting-bold" width={16} height={16} />
                      <Icon icon="streamline-ultimate:meeting-remote" width={16} height={16} />
                      <span>Remote Audience + Presenter</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="font-medium">Instructions: </span>
              <span className="whitespace-pre-line">
                {hybrid.instructions ?? "None"}
              </span>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
