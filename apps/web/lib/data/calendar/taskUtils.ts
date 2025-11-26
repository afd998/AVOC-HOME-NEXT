import type { TaskWithDict } from "../tasks/tasks";

const TIMELINE_START_HOUR = 7;
const PIXELS_PER_MINUTE = 2.5;
const ROOM_LABEL_WIDTH = 96;
const EVENT_MARGIN = 1;

type TaskRow = TaskWithDict;

export type DerivedTaskMetrics = {
  startMinutes: number;
  left: string;
};

export type HydratedTask = TaskRow & {
  derived: DerivedTaskMetrics;
};

/**
 * Adds display columns (derived metrics) to tasks for calendar rendering
 * @param tasks - Array of tasks to hydrate
 * @returns Array of tasks with derived display metrics
 */
export function addDisplayColumns(tasks: TaskRow[]): HydratedTask[] {
  return tasks.map((task) => {
    const [startHour, startMin] = task.startTime.split(":").map(Number);
    const taskStartMinutes = startHour * 60 + startMin;
    const startMinutesRelative = taskStartMinutes - TIMELINE_START_HOUR * 60;
    return {
      ...task,
      derived: {
        startMinutes: startMinutesRelative,
        left: `${
          startMinutesRelative * PIXELS_PER_MINUTE +
          EVENT_MARGIN -
          ROOM_LABEL_WIDTH
        }px`,
      },
    };
  });
}

