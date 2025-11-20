"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import type { EventAVConfigRow } from "@/lib/db/types";
import { Circle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemTitle,
  ItemDescription,
} from "../../../components/ui/item";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import TwentyFiveLiveResources from "./25LiveResources";
import AvConfiguration from "../../av-config/AvConfiguration";

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
        <ItemGroup>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>Type</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Badge>{event.eventType || "Unknown"}</Badge>
            </ItemActions>
          </Item>
          <Item size="sm">
            <ItemMedia variant="icon">
              <img 
                src="/images/zoomicon.png" 
                alt="Zoom" 
                className={`size-4 ${!event.hybrid ? 'opacity-40 grayscale' : ''}`}
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Hybrid</ItemTitle>
              <ItemDescription>
                {event.hybrid ? (
                  <div className="space-y-1">
                    {event.hybrid.meetingLink && (
                      <div className="text-sm">
                        <span className="font-medium">Meeting Link: </span>
                        <a
                          href={event.hybrid.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {event.hybrid.meetingLink}
                        </a>
                      </div>
                    )}
                    {event.hybrid.meetingId && (
                      <div className="text-sm">
                        <span className="font-medium">Meeting ID: </span>
                        {event.hybrid.meetingId}
                      </div>
                    )}
                    {event.hybrid.instructions && (
                      <div className="text-sm">
                        <span className="font-medium">Instructions: </span>
                        {event.hybrid.instructions}
                      </div>
                    )}
                    {event.hybrid.config && (
                      <div className="text-sm">
                        <span className="font-medium">Config: </span>
                        {event.hybrid.config}
                      </div>
                    )}
                    {!event.hybrid.meetingLink && !event.hybrid.meetingId && !event.hybrid.instructions && !event.hybrid.config && (
                      <span className="text-muted-foreground">No hybrid configuration</span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No hybrid configuration</span>
                )}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemMedia variant="icon">
              <Circle className={`size-4 fill-red-500 text-red-500 ${!event.recording ? 'opacity-40 grayscale' : ''}`} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Recording</ItemTitle>
              <ItemDescription>
                {event.recording ? (
                  <>
                    {event.recording.type && (
                      <span className="block">{event.recording.type}</span>
                    )}
                    {event.recording.instructions && (
                      <span className="block">{event.recording.instructions}</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">No recording</span>
                )}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>Other Hardware</ItemTitle>
              <ItemDescription>
                {event.otherHardware && event.otherHardware.length > 0 ? (
                  <div className="space-y-1">
                    {event.otherHardware.map((hw, index) => {
                      const hardwareName = typeof hw.otherHardwareDict === 'string' 
                        ? hw.otherHardwareDict
                        : (typeof hw.otherHardwareDict === 'object' && hw.otherHardwareDict !== null
                          ? (hw.otherHardwareDict as { id: string }).id
                          : String(hw.otherHardwareDict));
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
          {event.avConfig && (
            <AvConfiguration 
              avConfig={event.avConfig} 
              roomName={roomName}
              editable={isEventStarted}
              onUpdate={handleUpdate}
            />
          )}
          {event.resources.length > 0 && (
            <div className="self-end">
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
                <PopoverContent align="start" className="w-[600px] max-w-[90vw] break-words">
                  <TwentyFiveLiveResources resources={event.resources} />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

