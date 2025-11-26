import HomePage2 from "./components/HomePage2";
import CalendarTaskSplit from "./components/CalendarTaskSplit";
import ActionsPanel from "./components/ActionsPanel";
import { CalendarShellProvider } from "./components/CalendarShellProvider";
import { getCalendar } from "@/lib/data/calendar/calendar";
import { getActionsCalendar } from "@/lib/data/calendar/actionsCalendar";
import CalendarActionsHydrator from "./components/CalendarActionsHydrator";

type CalendarPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string; autoHide?: string }>;
};

export default async function CalendarPage({
  params,
  searchParams,
}: CalendarPageProps) {
  console.log("[calendar slug] resolving params");
  const { slug } = await params;
  console.log("[calendar slug] params resolved", slug);
  const { filter: filterParam, autoHide: autoHideParam } = await searchParams;
  const filter = filterParam || "All Rooms";
  const autoHide = autoHideParam === "true" || autoHideParam === "1";

  console.log(
    "[calendar slug] fetching data",
    JSON.stringify({ slug, filter, autoHide })
  );
  const [calendar, actionGroups] = await Promise.all([
    getCalendar(slug, filter, autoHide),
    getActionsCalendar(slug, filter, autoHide),
  ]);
  console.log("[calendar slug] calendar fetched", {
    hasCalendar: Boolean(calendar),
  });
  console.log("[calendar slug] actionGroups fetched", {
    type: Array.isArray(actionGroups) ? "array" : typeof actionGroups,
    count: Array.isArray(actionGroups) ? actionGroups.length : undefined,
  });
  return (
    <>
      <CalendarActionsHydrator
        actionGroups={actionGroups}
        date={slug}
        filter={filter}
        autoHide={autoHide}
      />
      <div className="h-[calc(100vh-4rem)]">
        <CalendarTaskSplit>
          <div className="h-full">
            <CalendarShellProvider>
              <HomePage2
                filter={filter}
                autoHide={autoHide}
                slug={slug}
                calendar={calendar}
              />
            </CalendarShellProvider>
          </div>
     <ActionsPanel />
        </CalendarTaskSplit>
      </div>
    </>
  );
}
