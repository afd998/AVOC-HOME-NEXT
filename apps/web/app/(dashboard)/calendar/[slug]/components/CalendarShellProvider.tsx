'use client';

import { Suspense, type ReactNode, createContext, useContext, useMemo, useState, useCallback } from "react";
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
  contentWidth: number;
  scrollLeft: number;
  scrollTop: number;
  setActualRowCount: (count: number) => void;
  setDataAutoHide: (value: "true" | undefined) => void;
  setHeaderAddon: (node: ReactNode | null) => void;
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
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [headerAddon, setHeaderAddonState] = useState<ReactNode | null>(null);

  // Calculate content width based on calendar config
  const totalMinutes = Math.max(1, (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60);
  const contentWidth = totalMinutes * CALENDAR_PIXELS_PER_MINUTE;

  const handleScrollChange = useCallback((position: { left: number; top: number }) => {
    setScrollLeft(position.left);
    setScrollTop(position.top);
  }, []);

  const setHeaderAddon = useCallback((node: ReactNode | null) => {
    setHeaderAddonState(node);
  }, []);

  const contextValue = useMemo<CalendarShellContextValue>(
    () => ({
      actualRowCount,
      dataAutoHide,
      startHour: CALENDAR_START_HOUR,
      endHour: CALENDAR_END_HOUR,
      pixelsPerMinute: CALENDAR_PIXELS_PER_MINUTE,
      rowHeightPx: CALENDAR_ROW_HEIGHT_PX,
      pageZoom: CALENDAR_PAGE_ZOOM,
      contentWidth,
      scrollLeft,
      scrollTop,
      setActualRowCount,
      setDataAutoHide,
      setHeaderAddon,
    }),
    [actualRowCount, dataAutoHide, contentWidth, scrollLeft, scrollTop, setHeaderAddon]
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
        headerHeightPx={headerAddon ? 0 : 24}
        className="h-[calc(100vh-4rem)]"
        dataAutoHide={dataAutoHide}
        onScrollChange={handleScrollChange}
        header={
          <div className="flex flex-col gap-1">
            {headerAddon}
            <TimeGrid
              pageZoom={CALENDAR_PAGE_ZOOM}
              startHour={CALENDAR_START_HOUR}
              endHour={CALENDAR_END_HOUR}
              pixelsPerMinute={CALENDAR_PIXELS_PER_MINUTE * CALENDAR_PAGE_ZOOM}
              sticky={false}
            />
          </div>
        }
      >
        <Suspense fallback={null}>{children}</Suspense>
      </CalendarDragShell>
    </CalendarShellContext.Provider>
  );
}
