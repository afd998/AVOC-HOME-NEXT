import type { HydratedTask } from "@/lib/data/calendar/taskUtils";

export type EnhancedTask = {
  roomName: string;
  task: HydratedTask;
  startMinutes: number | null;
  startLabel: string;
};

export type RecordingGroupItem = {
  type: "recording-group";
  groupKey: string;
  startLabel: string;
  tasks: EnhancedTask[];
  roomNames: string[];
};

export type TaskListItem =
  | { type: "task"; entry: EnhancedTask }
  | RecordingGroupItem;
