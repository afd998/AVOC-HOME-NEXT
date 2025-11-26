import EventDetailHeader from "@/core/event/EventDetails/EventDetailHeader";
import EventActionsSection from "@/core/event/EventDetails/EventActionsSection";
import { getEventById } from "@/lib/data/calendar/event/events";
type EventsPageProps = {
  params: { slug: string };
};

export default async function EventsPage(props: EventsPageProps) {
  const { slug } = await props.params;
  console.log(slug);
  const event = await getEventById(slug);

  if (!event) {
    return <div>Event not found</div>;
  }
  return (
    <div>
      <EventDetailHeader event={event} />
      <EventActionsSection event={event} />
    </div>
  );
}
