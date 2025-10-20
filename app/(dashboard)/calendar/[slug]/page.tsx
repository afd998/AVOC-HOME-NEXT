import { getCalendar } from "@/lib/data/calendar/calendar";
import HomePage2 from "./components/HomePage2";

export default async function CalendarPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string; autoHide?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const filter = searchParams.filter || "All Rooms";
  const autoHideParam = searchParams.autoHide;
  const autoHide = autoHideParam === "true" || autoHideParam === "1";

  const calendar = await getCalendar(params.slug, filter, autoHide);

  return (
    <div>
      <HomePage2
        calendar={calendar}
        date={params.slug}
        filter={filter}
        autoHide={autoHide}
      />
    </div>
  );
}
