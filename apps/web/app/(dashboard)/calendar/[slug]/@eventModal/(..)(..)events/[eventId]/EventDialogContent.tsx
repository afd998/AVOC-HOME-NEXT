"use client";

import EventDetailHeader from "@/core/event/EventDetails/EventDetailHeader";
import EventActionsSection from "@/core/event/EventDetails/EventActionsSection";

type EventDialogContentProps = {
  eventId: string;
};

export default function EventDialogContent({ eventId }: EventDialogContentProps) {
  return (
    <div className="relative rounded-lg bg-transparent h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            {/* Main Content */}
            <div className="w-full flex-1">
              <EventDetailHeader eventId={eventId} />
              <EventActionsSection eventId={eventId} />
              {/* Panopto Recording Checks Timeline - Show if event has recording resources */}
              {/* {hasRecordingResource && <Panopto event={event} />} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

