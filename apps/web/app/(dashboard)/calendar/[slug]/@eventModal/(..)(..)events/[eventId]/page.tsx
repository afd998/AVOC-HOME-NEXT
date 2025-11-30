import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EventDialogShell from "@/app/(dashboard)/calendar/[slug]/@eventModal/EventDialogShell";
import EventDialogContent from "./EventDialogContent";
import { getEventById } from "@/lib/data/calendar/event/events";
import { getQueryClient } from "@/lib/query";

type EventsPageProps = {
  params: Promise<{ slug: string; eventId: string }>;
};

export default async function EventsPage(props: EventsPageProps) {
  const { slug, eventId } = await props.params;

  const queryClient = getQueryClient();

  // Prefetch the event
  await queryClient.prefetchQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDialogShell>
        <EventDialogContent eventId={eventId} />
      </EventDialogShell>
    </HydrationBoundary>
  );
}
