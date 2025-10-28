import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

import type { EnhancedTask, TaskListItem } from "./types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(time?: string) {
  if (!time) return "No start time";

  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return timeFormatter.format(date);
}

function convertTimeToMinutes(time?: string) {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  return hour * 60 + minute;
}

function getStartMinutes(task: HydratedTask) {
  if (typeof task.derived?.startMinutes === "number") {
    return task.derived.startMinutes;
  }
  return convertTimeToMinutes(task.startTime);
}

export function buildTaskListItems(
  taskGroups: { roomName: string; tasks: HydratedTask[] }[]
) {
  const flattened: EnhancedTask[] = taskGroups.flatMap((group) =>
    group.tasks.map((task) => ({
      roomName: group.roomName,
      task,
      startMinutes: getStartMinutes(task),
      startLabel: formatTime(task.startTime),
    }))
  );

  const sortedTasks = flattened.sort((a, b) => {
    const aStart = a.startMinutes ?? Number.MAX_SAFE_INTEGER;
    const bStart = b.startMinutes ?? Number.MAX_SAFE_INTEGER;

    if (aStart === bStart) {
      const typeA = a.task.taskType ?? "";
      const typeB = b.task.taskType ?? "";
      return typeA.localeCompare(typeB);
    }

    return aStart - bStart;
  });

  const items = sortedTasks.reduce<TaskListItem[]>((acc, entry) => {
    if (entry.task.taskType === "RECORDING CHECK") {
      const groupKey =
        entry.startMinutes !== null
          ? `recording-${entry.startMinutes}`
          : `recording-${entry.task.startTime ?? entry.task.id}`;
      const previous = acc.at(-1);

      if (previous?.type === "recording-group" && previous.groupKey === groupKey) {
        previous.tasks.push(entry);
        if (!previous.roomNames.includes(entry.roomName)) {
          previous.roomNames.push(entry.roomName);
        }
      } else {
        acc.push({
          type: "recording-group",
          groupKey,
          startLabel: entry.startLabel,
          tasks: [entry],
          roomNames: [entry.roomName],
        });
      }

      return acc;
    }

    acc.push({ type: "task", entry });
    return acc;
  }, []);

  return { items, totalTasks: sortedTasks.length };
}
