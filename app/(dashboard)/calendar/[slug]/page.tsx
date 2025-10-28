import HomePage2 from "./components/HomePage2";
import CalendarTaskSplit from "./components/CalendarTaskSplit";
import TaskPanel from "./components/TaskPanel";
import { CalendarShellProvider } from "./components/CalendarShellProvider";
import { getCalendar } from "@/lib/data/calendar/calendar";
import { getTasksCalendar } from "@/lib/data/calendar/taskscalendar";
import CalendarTasksHydrator from "./components/CalendarTasksHydrator";

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
  const [calendar, taskGroups] = await Promise.all([
    getCalendar(slug, filter, autoHide),
    getTasksCalendar(slug, filter, autoHide),
  ]);
  console.log("[calendar slug] calendar fetched", {
    hasCalendar: Boolean(calendar),
  });
  console.log("[calendar slug] taskGroups fetched", {
    type: Array.isArray(taskGroups) ? "array" : typeof taskGroups,
    count: Array.isArray(taskGroups) ? taskGroups.length : undefined,
  });
  return (
    <>
      <CalendarTasksHydrator
        taskGroups={taskGroups}
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
     <TaskPanel />
        </CalendarTaskSplit>
      </div>
    </>
  );
}
