import VerticalLines from "@/app/(dashboard)/calendar/[slug]/components/VerticalLines";
import RoomRows from "@/app/(dashboard)/calendar/[slug]/components/RoomRows";
import CalendarShellMetricsUpdater from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellMetricsUpdater";
import CurrentTimeIndicator from "@/app/(dashboard)/calendar/[slug]/components/CurrentTimeIndicator";
import {
  CALENDAR_END_HOUR,
  CALENDAR_PIXELS_PER_MINUTE,
  CALENDAR_ROW_HEIGHT_PX,
  CALENDAR_START_HOUR,
} from "@/app/(dashboard)/calendar/[slug]/calendarConfig";
import type { RoomRowData } from "@/lib/data/calendar/calendar";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

type HomePage2Props = {
  filter: string;
  autoHide: boolean;
  slug: string;
  calendar: RoomRowData[];
  tasks: { roomName: string; tasks: HydratedTask[] }[];
};

export default function HomePage2({
  filter,
  autoHide,
  slug,
  calendar,
  tasks,
}: HomePage2Props) {
  const actualRowCount = calendar.length;
  const safeRowCount = Math.max(actualRowCount, 1);

  return (
    <>
      <CalendarShellMetricsUpdater
        actualRowCount={actualRowCount}
        autoHide={autoHide}
      />
      <div className="pointer-events-none absolute inset-0">
        <VerticalLines
          startHour={CALENDAR_START_HOUR}
          endHour={CALENDAR_END_HOUR}
          pixelsPerMinute={CALENDAR_PIXELS_PER_MINUTE}
          actualRowCount={safeRowCount}
          rowHeightPx={CALENDAR_ROW_HEIGHT_PX}
        />
        <CurrentTimeIndicator
          startHour={CALENDAR_START_HOUR}
          endHour={CALENDAR_END_HOUR}
          pixelsPerMinute={CALENDAR_PIXELS_PER_MINUTE}
        />
      </div>
      <div className="relative pointer-events-auto">
        <RoomRows
          calendar={calendar}
          tasks={tasks}
          date={slug}
          filter={filter}
          autoHide={autoHide}
        />
      </div>
    </>
  );
}
