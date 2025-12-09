"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "../../../components/ui/card";
import {
  ItemGroup,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "../../../components/ui/item";
import AvConfiguration from "../../av-config/AvConfiguration";
import HybridConfiguration from "./HybridConfiguration";
import RecordingConfiguration from "./RecordingConfiguration";
import { EventConfigurationProvider } from "./EventConfigurationContext";
import { updateEventConfiguration, type EventConfigurationUpdates } from "@/lib/actions/updateEventConfiguration";

interface EventConfigurationProps {
  event: finalEvent;
  roomName: string;
  headerTitle?: string;
  headerHref?: string;
  showHybrid?: boolean;
  showRecording?: boolean;
  showAvConfig?: boolean;
  showOtherHardware?: boolean;
}

export default function EventConfiguration({ 
  event, 
  roomName,
  headerTitle,
  headerHref,
  showHybrid = true,
  showRecording = true,
  showAvConfig = true,
  showOtherHardware = true,
}: EventConfigurationProps) {
  // Check if event has started
  const isEventStarted = useMemo(() => {
    if (!event.date || !event.startTime) return false;
    
    const now = new Date();
    
    // Create event start datetime
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    
    // Check if current time is >= event start time (works for past, present, and future dates)
    return now >= eventStart;
  }, [event.date, event.startTime]);

  // Unified update function for all configuration updates
  const handleUpdate = useCallback(async (updates: EventConfigurationUpdates) => {
    const result = await updateEventConfiguration(event.id, updates);
    if (!result.success) {
      console.error("[EventConfiguration] Failed to update configuration:", result.error);
      throw new Error(result.error || "Failed to update configuration");
    }
  }, [event.id]);

  return (
    <EventConfigurationProvider isEditable={isEventStarted} onUpdate={handleUpdate}>
      <Card className="mb-3">
        {headerTitle ? (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold leading-tight">
              {headerHref ? (
                <Link href={headerHref} className="hover:underline">
                  {headerTitle}
                </Link>
              ) : (
                headerTitle
              )}
            </CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 md:gap-4">
            {showHybrid && (
              <ItemGroup className="flex-1 min-w-[260px] basis-[320px]">
                <HybridConfiguration hybrid={event.hybrid} />
              </ItemGroup>
            )}

            {showRecording && (
              <ItemGroup className="flex-1 min-w-[260px] basis-[320px]">
                <RecordingConfiguration recording={event.recording} />
              </ItemGroup>
            )}

            {showAvConfig && event.avConfig && (
              <ItemGroup className="flex-[2] min-w-[340px] basis-[460px] grow">
                <AvConfiguration
                  avConfig={event.avConfig}
                  roomName={roomName}
                />
              </ItemGroup>
            )}

            {showOtherHardware && (
              <ItemGroup className="flex-1 min-w-[260px] basis-[320px]">
                <Item size="sm" className="flex-1 items-start">
                  <ItemContent>
                    <ItemTitle>Other Hardware</ItemTitle>
                    {event.otherHardware && event.otherHardware.length > 0 ? (
                      <ItemDescription asChild>
                        <div className="space-y-1">
                          {event.otherHardware.map((hw, index) => {
                            const hardwareName =
                              typeof hw.otherHardwareDict === "string"
                                ? hw.otherHardwareDict
                                : typeof hw.otherHardwareDict === "object" &&
                                  hw.otherHardwareDict !== null
                                ? (hw.otherHardwareDict as { id: string }).id
                                : String(hw.otherHardwareDict);
                            return (
                              <div key={index} className="text-sm">
                                {hardwareName}
                                {hw.quantity && hw.quantity > 1 && ` (${hw.quantity})`}
                                {hw.instructions && (
                                  <span className="block text-xs text-muted-foreground mt-0.5">
                                    {hw.instructions}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ItemDescription>
                    ) : (
                      <ItemDescription>
                        <span className="text-muted-foreground">No other hardware</span>
                      </ItemDescription>
                    )}
                  </ItemContent>
                </Item>
              </ItemGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end pt-0 text-xs text-muted-foreground">
          Event ID: {event.id}
        </CardFooter>
      </Card>
    </EventConfigurationProvider>
  );
}
