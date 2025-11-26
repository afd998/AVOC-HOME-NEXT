"use client";

import { useEffect, useRef } from "react";
import {
  useCalendarActionsStore,
  type ActionGroup,
} from "../stores/useCalendarActionsStore";

type CalendarActionsHydratorProps = {
  actionGroups: ActionGroup[];
  date: string;
  filter: string;
  autoHide: boolean;
};

export default function CalendarActionsHydrator({
  actionGroups,
  date,
  filter,
  autoHide,
}: CalendarActionsHydratorProps) {
  const setInitialData = useCalendarActionsStore((state) => state.setInitialData);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      setInitialData({ actionGroups, date, filter, autoHide });
      return;
    }

    setInitialData({ actionGroups, date, filter, autoHide });
    initializedRef.current = true;
  }, [autoHide, date, filter, setInitialData, actionGroups]);

  return null;
}

