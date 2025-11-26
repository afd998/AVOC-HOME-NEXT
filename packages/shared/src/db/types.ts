import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  actions,
  events,
  qcItems,
  qcItemDict,
  resourceEvents,
  facultyEvents,
  roomFilters,
  shiftBlocks,
  eventHybrid,
  eventAvConfig,
  eventOtherHardware,
  eventRecording,
  qcStatus,
  failMode,
  waitedReason,
  faculty,
  facultySetup,
} from "./schema";

export type RoomFilter = InferSelectModel<typeof roomFilters>;
export type Event = InferSelectModel<typeof events>;
export type ShiftBlock = InferSelectModel<typeof shiftBlocks>;
export type ActionRow = InferInsertModel<typeof actions>;
export type Faculty = InferSelectModel<typeof faculty>;
export type FacultySetup = InferSelectModel<typeof facultySetup>;

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
export type QcItemRow = InferInsertModel<typeof qcItems>;
export type QcItemDictRow = InferSelectModel<typeof qcItemDict>;
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

// Enum value types for client-side use (no runtime dependency on drizzle)
export type QCStatus = (typeof qcStatus.enumValues)[number];
export type FailMode = (typeof failMode.enumValues)[number];
export type WaivedReason = (typeof waitedReason.enumValues)[number];

// Enum values as const arrays for client-side use
export const QC_STATUS_VALUES = ['na', 'pass', 'fail'] as const;
export const FAIL_MODE_VALUES = ['Ticketed', 'Resolved Immediately'] as const;
export const WAIVED_REASON_VALUES = ['Faculty Noncompliance'] as const;