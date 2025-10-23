'use client';

import { Suspense, type ReactNode, createContext, useContext, useMemo, useState } from "react";
import CalendarDragShell from "@/app/(dashboard)/calendar/[slug]/components/CalendarDragShell";
import TimeGrid from "@/app/(dashboard)/calendar/[slug]/components/TimeGrid";
import {
  CALENDAR_END_HOUR,
  CALENDAR_PAGE_ZOOM,
  CALENDAR_PIXELS_PER_MINUTE,
  CALENDAR_ROW_HEIGHT_PX,
  CALENDAR_START_HOUR,
} from "@/app/(dashboard)/calendar/[slug]/calendarConfig";

type CalendarShellContextValue = {
  actualRowCount: number;
  dataAutoHide?: "true";
  startHour: number;
  endHour: number;
  pixelsPerMinute: number;
  rowHeightPx: number;
  pageZoom: number;
  setActualRowCount: (count: number) => void;
  setDataAutoHide: (value: "true" | undefined) => void;
};

const CalendarShellContext = createContext<CalendarShellContextValue | null>(null);

export function useCalendarShell() {
  const context = useContext(CalendarShellContext);
  if (!context) {
    throw new Error("useCalendarShell must be used within a CalendarShellProvider");
  }
  return context;
}

export function CalendarShellProvider({ children }: { children: ReactNode }) {
  const [actualRowCount, setActualRowCount] = useState(1);
  const [dataAutoHide, setDataAutoHide] = useState<"true" | undefined>(undefined);

  const contextValue = useMemo<CalendarShellContextValue>(
    () => ({
      actualRowCount,
      dataAutoHide,
      startHour: CALENDAR_START_HOUR,
      endHour: CALENDAR_END_HOUR,
      pixelsPerMinute: CALENDAR_PIXELS_PER_MINUTE,
      rowHeightPx: CALENDAR_ROW_HEIGHT_PX,
      pageZoom: CALENDAR_PAGE_ZOOM,
      setActualRowCount,
      setDataAutoHide,
    }),
    [actualRowCount, dataAutoHide]
  );

  return (
    <CalendarShellContext.Provider value={contextValue}>
      <CalendarDragShell
        startHour={CALENDAR_START_HOUR}
        endHour={CALENDAR_END_HOUR}
        pixelsPerMinute={CALENDAR_PIXELS_PER_MINUTE}
        actualRowCount={actualRowCount}
        rowHeightPx={CALENDAR_ROW_HEIGHT_PX}
        pageZoom={CALENDAR_PAGE_ZOOM}
        className="h-[calc(100vh-8rem)]"
        dataAutoHide={dataAutoHide}
        header={
          <TimeGrid
            pageZoom={CALENDAR_PAGE_ZOOM}
            startHour={CALENDAR_START_HOUR}
            endHour={CALENDAR_END_HOUR}
            pixelsPerMinute={CALENDAR_PIXELS_PER_MINUTE * CALENDAR_PAGE_ZOOM}
            sticky={false}
          />
        }
      >
        <Suspense fallback={null}>{children}</Suspense>
      </CalendarDragShell>
    </CalendarShellContext.Provider>
  );
}
