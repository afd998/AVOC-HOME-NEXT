import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EventDetailHeader from "@/core/event/EventDetails/EventDetailHeader";
import EventActionsSection from "@/core/event/EventDetails/EventActionsSection";
import { getEventById } from "@/lib/data/calendar/event/events";
import { getQueryClient } from "@/lib/query";

type EventsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventsPage(props: EventsPageProps) {
  const { slug } = await props.params;
  
  const queryClient = getQueryClient();

  // Prefetch the event
  await queryClient.prefetchQuery({
    queryKey: ["event", slug],
    queryFn: () => getEventById(slug),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <EventDetailHeader eventId={slug} />
      <EventActionsSection eventId={slug} />
    </HydrationBoundary>
  );
}
