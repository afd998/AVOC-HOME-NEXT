"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import type { EventAVConfigRow } from "@/lib/db/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  ItemGroup,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "../../../components/ui/item";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import TwentyFiveLiveResources from "./25LiveResources";
import AvConfiguration from "../../av-config/AvConfiguration";
import HybridConfiguration from "./HybridConfiguration";
import RecordingConfiguration from "./RecordingConfiguration";

interface EventConfigurationProps {
  event: finalEvent;
  roomName: string;
}

export default function EventConfiguration({ event, roomName }: EventConfigurationProps) {
  const router = useRouter();

  // Check if event has started
  const isEventStarted = useMemo(() => {
    if (!event.date || !event.startTime) return false;
    
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    
    // If event is not today, it hasn't started
    if (event.date !== today) {
      return false;
    }
    
    // Create event start datetime
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    
    // Check if current time is >= event start time
    return now >= eventStart;
  }, [event.date, event.startTime]);

  const handleUpdate = async (updates: Partial<EventAVConfigRow>) => {
    try {
      const response = await fetch(`/api/events/${event.id}/av-config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update AV configuration");
      }

      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error("[EventConfiguration] Failed to update AV config", error);
      throw error;
    }
  };
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Event Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-3 md:gap-4">
          <ItemGroup className="flex-1 min-w-[260px] basis-[320px]">
            <HybridConfiguration hybrid={event.hybrid} />
          </ItemGroup>

          <ItemGroup className="flex-1 min-w-[260px] basis-[320px]">
            <RecordingConfiguration recording={event.recording} />
          </ItemGroup>

          {event.avConfig && (
            <ItemGroup className="flex-[2] min-w-[340px] basis-[460px] grow">
              <AvConfiguration
                avConfig={event.avConfig}
                roomName={roomName}
                editable={isEventStarted}
                onUpdate={handleUpdate}
              />
            </ItemGroup>
          )}

          <ItemGroup className="flex-1 min-w-[260px] basis-[320px]">
            <Item size="sm" className="flex-1 items-start">
              <ItemContent>
                <ItemTitle>Other Hardware</ItemTitle>
                <ItemDescription>
                  {event.otherHardware && event.otherHardware.length > 0 ? (
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
                  ) : (
                    <span className="text-muted-foreground">No other hardware</span>
                  )}
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </div>

        {event.resources.length > 0 && (
          <div className="mt-3 flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-auto hover:bg-accent hover:text-accent-foreground"
                >
                  <span>25Live{"\u00ae"} Resources</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[600px] max-w-[90vw] break-words"
              >
                <TwentyFiveLiveResources resources={event.resources} />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

