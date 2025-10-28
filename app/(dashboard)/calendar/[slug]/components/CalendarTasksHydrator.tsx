"use client";

import { useEffect, useRef } from "react";
import {
  useCalendarTasksStore,
  type TaskGroup,
} from "../stores/useCalendarTasksStore";

type CalendarTasksHydratorProps = {
  taskGroups: TaskGroup[];
  date: string;
  filter: string;
  autoHide: boolean;
};

export default function CalendarTasksHydrator({
  taskGroups,
  date,
  filter,
  autoHide,
}: CalendarTasksHydratorProps) {
  const setInitialData = useCalendarTasksStore((state) => state.setInitialData);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      setInitialData({ taskGroups, date, filter, autoHide });
      return;
    }

    setInitialData({ taskGroups, date, filter, autoHide });
    initializedRef.current = true;
  }, [autoHide, date, filter, setInitialData, taskGroups]);

  return null;
}
