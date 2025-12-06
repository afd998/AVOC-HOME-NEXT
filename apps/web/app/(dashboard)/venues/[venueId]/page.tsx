import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getVenueById } from "@/lib/data/venues";
import { getQueryClient } from "@/lib/query";
import VenuePageContent from "./components/VenuePageContent";

type VenuePageProps = {
  params: Promise<{ venueId: string }>;
};

export default async function VenuePage({
  params,
}: VenuePageProps) {
  const { venueId } = await params;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["venue", venueId],
    queryFn: async () => {
      const venue = await getVenueById(venueId);
      if (!venue) {
        throw new Error("Venue not found");
      }
      return venue;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VenuePageContent venueId={venueId} />
    </HydrationBoundary>
  );
}
