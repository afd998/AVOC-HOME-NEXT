"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import Task from "./Task";
import { createClient } from "@/lib/supabase/client";
import { useCalendarTasksStore } from "../../stores/useCalendarTasksStore";

let sharedSupabaseClient: ReturnType<typeof createClient> | null = null;
let sharedChannel: RealtimeChannel | null = null;
let sharedDate: string | null = null;
let sharedSubscriberCount = 0;
const latestRefreshCallback: { current: (() => Promise<void>) | null } = {
  current: null,
};

const getSupabaseClient = () => {
  if (!sharedSupabaseClient) {
    sharedSupabaseClient = createClient();
  }
  return sharedSupabaseClient;
};

type TasksProps = {
  roomName: string;
  rowHeightPx: number;
};

const EMPTY_TASKS: HydratedTask[] = [];

export default function Tasks({ roomName, rowHeightPx }: TasksProps) {
  const roomTaskGroup = useCalendarTasksStore(
    useCallback(
      (state) =>
        state.taskGroups.find((group) => group.roomName === roomName),
      [roomName]
    )
  );
  const roomTasks = roomTaskGroup?.tasks ?? EMPTY_TASKS;
  const date = useCalendarTasksStore((state) => state.date);
  const filter = useCalendarTasksStore((state) => state.filter);
  const autoHide = useCalendarTasksStore((state) => state.autoHide);
  const setTaskGroups = useCalendarTasksStore((state) => state.setTaskGroups);

  const tasks = useMemo(
    () =>
      roomTasks.filter(
        (task) => task.taskType && task.taskType !== "RECORDING CHECK"
      ),
    [roomTasks]
  );

  const refreshTasks = useCallback(async () => {
    if (!date) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filter) {
        params.set("filter", filter);
      }
      params.set("autoHide", autoHide ? "1" : "0");
      const queryString = params.toString();
      const response = await fetch(
        `/api/calendar/${encodeURIComponent(date)}/tasks${
          queryString ? `?${queryString}` : ""
        }`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error(
          "[Tasks] Failed to refresh tasks",
          response.status,
          response.statusText
        );
        return;
      }

      const payload = await response.json();
      if (Array.isArray(payload)) {
        setTaskGroups(payload);
      } else if (Array.isArray(payload?.taskGroups)) {
        setTaskGroups(payload.taskGroups);
      }
    } catch (error) {
      console.error("[Tasks] Error refreshing tasks", error);
    }
  }, [autoHide, date, filter, setTaskGroups]);

  useEffect(() => {
    if (!date) {
      return;
    }

    const supabase = getSupabaseClient();
    sharedSubscriberCount += 1;
    latestRefreshCallback.current = refreshTasks;

    if (sharedChannel && sharedDate !== date) {
      supabase.removeChannel(sharedChannel);
      sharedChannel = null;
      sharedDate = null;
    }

    if (!sharedChannel) {
      sharedDate = date;
      sharedChannel = supabase
        .channel(`calendar-tasks:${date}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `date=eq.${date}`,
          },
          async () => {
            if (latestRefreshCallback.current) {
              await latestRefreshCallback.current();
            }
          }
        )
        .subscribe();
    }

    return () => {
      sharedSubscriberCount = Math.max(sharedSubscriberCount - 1, 0);
      if (sharedSubscriberCount === 0 && sharedChannel) {
        supabase.removeChannel(sharedChannel);
        sharedChannel = null;
        sharedDate = null;
        latestRefreshCallback.current = null;
      }
    };
  }, [date, refreshTasks]);

  return (
    <>
      {tasks.map((task) => (
        <Task key={task.id} task={task} rowHeightPx={rowHeightPx} />
      ))}
    </>
  );
}
