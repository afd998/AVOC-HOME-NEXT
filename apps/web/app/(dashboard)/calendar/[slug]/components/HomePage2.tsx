"use client";

import React from "react";
import VerticalLines from "@/app/(dashboard)/calendar/[slug]/components/VerticalLines";
import CalendarShellMetricsUpdater from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellMetricsUpdater";
import CurrentTimeIndicator from "@/app/(dashboard)/calendar/[slug]/components/CurrentTimeIndicator";
import ShiftBlockLines from "@/app/(dashboard)/calendar/[slug]/components/ActionAssignments/components/ShiftBlockLines";
import RoomRows from "@/app/(dashboard)/calendar/[slug]/components/RoomRows";
import { useCalendarShell } from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellProvider";
import {
  CALENDAR_END_HOUR,
  CALENDAR_PIXELS_PER_MINUTE,
  CALENDAR_ROW_HEIGHT_PX,
  CALENDAR_START_HOUR,
} from "@/app/(dashboard)/calendar/[slug]/calendarConfig";
import { useActionsQuery, useCalendarQuery } from "@/lib/query";
import { useEventAssignmentsStore } from "@/lib/stores/event-assignments";

type HomePage2Props = {
  filter: string;
  autoHide: boolean;
  slug: string;
};

export default function HomePage2({
  filter,
  autoHide,
  slug,
}: HomePage2Props) {
  const { data: calendar = [] } = useCalendarQuery({
    date: slug,
    filter,
    autoHide,
  });
  const { data: actionGroups = [] } = useActionsQuery({
    date: slug,
    filter,
    autoHide,
  });
  const { showEventAssignments } = useEventAssignmentsStore();
  const {
    pixelsPerMinute,
    contentWidth,
    pageZoom,
    scrollLeft,
    scrollTop,
    startHour,
    rowHeightPx,
    setHeaderAddon,
  } = useCalendarShell();
  const [selectedRange, setSelectedRange] = React.useState<{ leftPx: number; widthPx: number } | null>(null);

  const actualRowCount = calendar.length;
  const safeRowCount = Math.max(actualRowCount, 1);
  const overlayHeight = safeRowCount * CALENDAR_ROW_HEIGHT_PX * pageZoom;

  // Keep shift block tabs in the sticky header above the time axis
  React.useEffect(() => {
    if (showEventAssignments) {
      setHeaderAddon(
        <div className="bg-background/90 backdrop-blur border-b">
          <ShiftBlockLines
            date={slug}
            pixelsPerMinute={pixelsPerMinute}
            contentWidth={contentWidth}
            pageZoom={pageZoom}
            scrollLeft={scrollLeft}
            startHour={startHour}
            onSelectRange={setSelectedRange}
          />
        </div>
      );
    } else {
      setHeaderAddon(null);
    }
    return () => setHeaderAddon(null);
  }, [
    showEventAssignments,
    slug,
    pixelsPerMinute,
    contentWidth,
    pageZoom,
    scrollLeft,
    startHour,
    setHeaderAddon,
  ]);

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
          dateString={slug}
        />
      </div>
      {showEventAssignments && selectedRange && (
        <div className="pointer-events-none absolute inset-0 z-30">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${contentWidth}px`,
              height: `${overlayHeight}px`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${selectedRange.leftPx}px`,
                width: `${selectedRange.widthPx}px`,
                height: "100%",
                backgroundColor: "rgba(59, 131, 246, 0.18)",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      )}
      <div className="relative pointer-events-auto">
        <RoomRows
          calendar={calendar}
          dateString={slug}
          actionGroups={actionGroups}
        />
      </div>
    </>
  );
}
