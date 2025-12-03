"use client";

import type { finalEvent } from "@/lib/data/calendar/calendar";
import EventActionTimelineItem from "./EventActionTimelineItem";

interface EventActionsTimelineProps {
  actions: finalEvent["actions"];
}

export default function EventActionsTimeline({ actions }: EventActionsTimelineProps) {
  const hasActions = Array.isArray(actions) && actions.length > 0;

  if (!hasActions) {
    return (
      <div className="relative rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-4 py-6 text-xs text-muted-foreground">
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border/70" />
        No actions scheduled for this event.
      </div>
    );
  }

  // Sort actions by startTime
  const sortedActions = [...(actions ?? [])].sort((a, b) => {
    const timeA = a.startTime || "";
    const timeB = b.startTime || "";
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-6">
      {sortedActions.map((action) => (
        <EventActionTimelineItem key={action.id} action={action} />
      ))}
    </div>
  );
}
