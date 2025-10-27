import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import HomePage2 from "./components/HomePage2";
import CalendarTaskSplit from "./components/CalendarTaskSplit";
import TaskPanel from "./components/TaskPanel";
import { CalendarShellProvider } from "./components/CalendarShellProvider";
import { getCalendar } from "@/lib/data/calendar/calendar";
import { getTasksCalendar } from "@/lib/data/calendar/taskscalendar";

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


  const [calendar, tasks] = await Promise.all([
    getCalendar(slug, filter, autoHide),
    getTasksCalendar(slug, filter, autoHide),
  ]);

  return (
    <div className="h-[calc(100vh-4rem)]">
      <CalendarTaskSplit>
        <div className="h-full">
          <CalendarShellProvider>
            <HomePage2
              filter={filter}
              autoHide={autoHide}
              slug={slug}
              calendar={calendar}
              tasks={tasks}
            />
          </CalendarShellProvider>
        </div>
        <TaskPanel taskGroups={tasks} />
      </CalendarTaskSplit>
    </div>
  );
}
