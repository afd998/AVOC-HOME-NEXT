"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import AvConfiguration from "@/core/av-config/AvConfiguration";
import type { EventAVConfigRow } from "shared";

interface ActionAVConfigurationProps {
  avConfig: EventAVConfigRow;
  roomName: string;
  eventId: number;
  eventDate?: string;
  eventStartTime?: string;
}

export default function ActionAVConfiguration({
  avConfig,
  roomName,
  eventId,
  eventDate,
  eventStartTime,
}: ActionAVConfigurationProps) {
  const router = useRouter();

  // Check if event has started
  const isEventStarted = useMemo(() => {
    if (!eventDate || !eventStartTime) return false;
    
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    
    // If event is not today, it hasn't started
    if (eventDate !== today) {
      return false;
    }
    
    // Create event start datetime
    const eventStart = new Date(`${eventDate}T${eventStartTime}`);
    
    // Check if current time is >= event start time
    return now >= eventStart;
  }, [eventDate, eventStartTime]);

  const handleUpdate = async (updates: Partial<EventAVConfigRow>) => {
    try {
      const response = await fetch(`/api/events/${eventId}/av-config`, {
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
      console.error("[ActionAVConfiguration] Failed to update AV config", error);
      throw error;
    }
  };

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        AV Configuration
      </h3>
      <AvConfiguration 
        avConfig={avConfig} 
        roomName={roomName}
        editable={isEventStarted}
        onUpdate={handleUpdate}
      />
    </section>
  );
}

