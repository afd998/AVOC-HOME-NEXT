import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import HomePage2 from "./components/HomePage2";
import { CalendarShellProvider } from "./components/CalendarShellProvider";
import { getCalendar } from "@/lib/data/calendar/calendar";
import { getActionsCalendar } from "@/lib/data/calendar/actionsCalendar";
import { getShifts, getShiftBlocks, getProfiles } from "@/lib/data/assignments";
import { getQueryClient } from "@/lib/query";

type CalendarPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string; autoHide?: string }>;
};

export default async function CalendarPage({
  params,
  searchParams,
}: CalendarPageProps) {
  const { slug } = await params;
  const { filter: filterParam, autoHide: autoHideParam } = await searchParams;
  const filter = filterParam || "All Rooms";
  const autoHide = autoHideParam === "true" || autoHideParam === "1";

  const queryClient = getQueryClient();

  // Prefetch all queries in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["calendar", slug, filter, autoHide],
      queryFn: () => getCalendar(slug, filter, autoHide),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: ["actionpanel", slug, filter, autoHide],
      queryFn: () => getActionsCalendar(slug, filter, autoHide),
    }),
    // Prefetch assignments data
    queryClient.prefetchQuery({
      queryKey: ["shifts", slug],
      queryFn: () => getShifts(slug),
    }),
    queryClient.prefetchQuery({
      queryKey: ["shift_blocks", slug],
      queryFn: () => getShiftBlocks(slug),
    
    }),
    queryClient.prefetchQuery({
      queryKey: ["profiles"],
      queryFn: () => getProfiles(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-full min-h-0">
        <CalendarShellProvider>
          <HomePage2
            filter={filter}
            autoHide={autoHide}
            slug={slug}
          />
        </CalendarShellProvider>
      </div>
    </HydrationBoundary>
  );
}
