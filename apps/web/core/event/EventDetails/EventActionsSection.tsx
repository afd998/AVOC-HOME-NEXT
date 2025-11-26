"use client";

import type { finalEvent } from "@/lib/data/calendar/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import EventPageContent from "./EventPageContent";
import EventActionsTimeline from "./EventActionsTimeline";

interface EventActionsSectionProps {
  event: finalEvent;
}

export default function EventActionsSection({ event }: EventActionsSectionProps) {
  const actions = event.actions || [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <EventPageContent>
      <Card className="mb-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Actions</CardTitle>
            <Button variant="outline" size="icon" aria-label="Phone call">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <EventActionsTimeline actions={actions} />
        </CardContent>
      </Card>
    </EventPageContent>
  );
}

