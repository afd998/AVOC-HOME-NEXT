import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

export type EnhancedAction = {
  roomName: string;
  action: HydratedAction;
  startMinutes: number | null;
  startLabel: string;
};

export type RecordingGroupItem = {
  type: "recording-group";
  groupKey: string;
  startLabel: string;
  actions: EnhancedAction[];
  roomNames: string[];
};

export type ActionListItem =
  | { type: "action"; entry: EnhancedAction }
  | RecordingGroupItem;

