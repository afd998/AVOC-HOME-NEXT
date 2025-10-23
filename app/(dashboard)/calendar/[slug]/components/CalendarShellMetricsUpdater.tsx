'use client';

import { useEffect } from "react";
import { useCalendarShell } from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellProvider";

interface CalendarShellMetricsUpdaterProps {
  actualRowCount: number;
  autoHide: boolean;
}

export default function CalendarShellMetricsUpdater({
  actualRowCount,
  autoHide,
}: CalendarShellMetricsUpdaterProps) {
  const { setActualRowCount, setDataAutoHide } = useCalendarShell();

  useEffect(() => {
    setActualRowCount(Math.max(actualRowCount, 1));
  }, [actualRowCount, setActualRowCount]);

  useEffect(() => {
    setDataAutoHide(autoHide ? "true" : undefined);
    return () => setDataAutoHide(undefined);
  }, [autoHide, setDataAutoHide]);

  return null;
}
