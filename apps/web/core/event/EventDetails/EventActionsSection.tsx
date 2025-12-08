"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Phone } from "lucide-react";
import EventPageContent from "./EventPageContent";
import EventActionsTimeline from "./EventActionsTimeline";
import { useEventQuery } from "@/lib/query";
import PhoneCallModal from "./PhoneCallModal";

interface EventActionsSectionProps {
  eventId: string;
}

export default function EventActionsSection({ eventId }: EventActionsSectionProps) {
  const { data: event } = useEventQuery({ eventId });
  const actions = event?.actions || [];
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  return (
    <EventPageContent>
      <Card className="mb-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Actions</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Help desk">
                <Icon icon="carbon:help-desk" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Phone call"
                onClick={() => setIsPhoneModalOpen(true)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <EventActionsTimeline actions={actions} />
        </CardContent>
      </Card>
      <PhoneCallModal
        event={event}
        actions={actions}
        open={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
      />
    </EventPageContent>
  );
}
