import EventDialogShell from "@/app/(dashboard)/calendar/[slug]/@eventModal/EventDialogShell";
import EventDetailHeader from "@/core/event/EventDetails/EventDetailHeader";
import EventActionsSection from "@/core/event/EventDetails/EventActionsSection";
import { getEventById } from "@/lib/data/calendar/event/events";

type EventsPageProps = {
  params: { slug: string; eventId: string };
};

export default async function EventsPage(props: EventsPageProps) {
  const { slug, eventId } = await props.params;

  return (
    <EventDialogShell>
      <EventDialogContent eventId={eventId} />
    </EventDialogShell>
  );
}

async function EventDialogContent({ eventId }: { eventId: string }) {
  const event = await getEventById(eventId);

  if (!event) {
    return null;
  }

  return (
    <div className="relative rounded-lg bg-transparent h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            {/* Main Content */}
            <div className="w-full flex-1">
              <EventDetailHeader event={event} />
              <EventActionsSection event={event} />
              {/* Panopto Recording Checks Timeline - Show if event has recording resources */}
              {/* {hasRecordingResource && <Panopto event={event} />} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
