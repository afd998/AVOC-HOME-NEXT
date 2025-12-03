import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query";
import { getVenues } from "@/lib/data/venues";
import VenueTable from "./components/VenueTable";

export default async function VenuesPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["venues"],
    queryFn: () => getVenues(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Venues</h1>
          <p className="text-sm text-muted-foreground">
            Browse all rooms and their types.
          </p>
        </div>
        <VenueTable />
      </div>
    </HydrationBoundary>
  );
}
