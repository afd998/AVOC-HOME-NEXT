import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getVenueCalendarRow } from "@/lib/data/calendar/calendar";
import { getQueryClient } from "@/lib/query";
import VenuePageContent from "./components/VenuePageContent";

type VenuePageProps = {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<{ date?: string; filter?: string; autoHide?: string }>;
};

export default async function VenuePage({
  params,
  searchParams,
}: VenuePageProps) {
  const { venueId } = await params;
  const { date: dateParam, filter: filterParam, autoHide: autoHideParam } =
    await searchParams;

  const date = dateParam ?? new Date().toISOString().split("T")[0];
  const filter = filterParam ?? "All Rooms";
  const autoHide =
    autoHideParam === "true" ||
    autoHideParam === "1" ||
    autoHideParam === "yes";

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["venue-calendar", venueId, date, filter, autoHide],
    queryFn: () => getVenueCalendarRow(date, venueId, filter, autoHide),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VenuePageContent
        venueId={venueId}
        date={date}
        filter={filter}
        autoHide={autoHide}
      />
    </HydrationBoundary>
  );
}
