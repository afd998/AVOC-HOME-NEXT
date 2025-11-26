"use client";

import type { finalEvent } from "@/lib/data/calendar/calendar";
import EventActionTimelineItem from "./EventActionTimelineItem";

interface EventActionsTimelineProps {
  actions: finalEvent["actions"];
}

export default function EventActionsTimeline({ actions }: EventActionsTimelineProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  // Sort actions by startTime
  const sortedActions = [...actions].sort((a, b) => {
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
