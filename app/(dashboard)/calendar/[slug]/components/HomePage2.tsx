import { getCalendar } from "@/lib/data/calendar/calendar";
import VerticalLines from "@/app/(dashboard)/calendar/[slug]/components/VerticalLines";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import RoomRows from "@/app/(dashboard)/calendar/[slug]/components/RoomRows";
import CalendarShellMetricsUpdater from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellMetricsUpdater";
import {
  CALENDAR_END_HOUR,
  CALENDAR_PIXELS_PER_MINUTE,
  CALENDAR_ROW_HEIGHT_PX,
  CALENDAR_START_HOUR,
} from "@/app/(dashboard)/calendar/[slug]/calendarConfig";
import { getTasksCalendar } from "@/lib/data/tasks/taskscalendar";

export default async function HomePage2(props: {
  filter: string;
  autoHide: boolean;
  slug: string;
}) {
  "use cache";
  cacheTag(
    `calendar:${props.slug}:${props.filter}:${props.autoHide ? "hide" : "show"}`
  );
  const [calendar, tasks] = await Promise.all([
    getCalendar(props.slug, props.filter, props.autoHide),
    getTasksCalendar(props.slug, props.filter, props.autoHide),
  ]);

  const actualRowCount = calendar.length;
  const safeRowCount = Math.max(actualRowCount, 1);

  return (
    <>
      <CalendarShellMetricsUpdater
        actualRowCount={actualRowCount}
        autoHide={props.autoHide}
      />
      <div className="pointer-events-none absolute inset-0">
        <VerticalLines
          startHour={CALENDAR_START_HOUR}
          endHour={CALENDAR_END_HOUR}
          pixelsPerMinute={CALENDAR_PIXELS_PER_MINUTE}
          actualRowCount={safeRowCount}
          rowHeightPx={CALENDAR_ROW_HEIGHT_PX}
        />
      </div>
      <div className="relative pointer-events-auto">
        <RoomRows
          calendar={calendar}
          tasks={tasks}
          date={props.slug}
          filter={props.filter}
          autoHide={props.autoHide}
        />
      </div>
    </>
  );
}
