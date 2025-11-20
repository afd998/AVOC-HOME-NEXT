import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  actions,
  events,
  qcItems,
  resourceEvents,
  facultyEvents,
  roomFilters,
  shiftBlocks,
  tasks,
  eventHybrid,
  eventAvConfig,
  eventOtherHardware,
  eventRecording,
} from "@/drizzle/schema";

export type RoomFilter = InferSelectModel<typeof roomFilters>;
export type Event = InferSelectModel<typeof events>;
export type ShiftBlock = InferSelectModel<typeof shiftBlocks>;
export type ActionRow = InferInsertModel<typeof actions>;

export type EventResource = {
  itemName: string;
  quantity: number | null;
  instruction: string | null;
};

export type ProcessedEvent = Omit<
  InferInsertModel<typeof events>,
  "resources"
> & {
  resources: EventResource[];
};

export type ResourceEventRow = InferInsertModel<typeof resourceEvents>;
export type FacultyEventRow = InferSelectModel<typeof facultyEvents>;
export type TaskRow = InferInsertModel<typeof tasks>;
export type QcItemRow = InferInsertModel<typeof qcItems>;
export type EventHybridRow = InferInsertModel<typeof eventHybrid>;
export type EventAVConfigRow = InferInsertModel<typeof eventAvConfig>;
export type EventOtherHardwareRow = InferInsertModel<typeof eventOtherHardware>;
export type EventRecordingRow = InferInsertModel<typeof eventRecording>;

export type EnrichedEvent = ProcessedEvent & {
  hybrid?: EventHybridRow;
  avConfig: EventAVConfigRow;
  otherHardware: EventOtherHardwareRow[];
  recording?: EventRecordingRow;
};