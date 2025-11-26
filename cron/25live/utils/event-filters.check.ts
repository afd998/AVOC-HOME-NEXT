import assert from "node:assert/strict";
import dayjs from "dayjs";
import { partitionEventsByStart } from "./event-filters";
import { type ProcessedEvent } from "../../lib/db/types";

const reference = dayjs("2024-01-15T10:00:00");

const baseEvent = {
  createdAt: "2024-01-10T00:00:00.000Z",
  eventType: "Lecture",
  lectureTitle: null,
  roomName: "Test Room",
  resources: [],
  id: 0,
  itemId2: null,
  startTime: "00:00:00",
  endTime: "00:00:00",
  raw: null,
  itemId: null,
  eventName: "Test Event",
  updatedAt: null,
  manOwner: null,
  date: "2024-01-15",
  instructorNames: null,
  organization: null,
  firstLecture: null,
  transform: null,
} satisfies ProcessedEvent;

const events: ProcessedEvent[] = [
  {
    ...baseEvent,
    id: 1,
    startTime: "09:00:00",
    endTime: "10:00:00",
    eventName: "Early Event",
  },
  {
    ...baseEvent,
    id: 2,
    startTime: "10:00:00",
    endTime: "11:00:00",
    eventName: "Boundary Event",
  },
  {
    ...baseEvent,
    id: 3,
    startTime: "10:01:00",
    endTime: "11:30:00",
    eventName: "Future Event",
  },
];

const { startedEvents, futureEvents } = partitionEventsByStart(
  events,
  reference
);

assert.deepStrictEqual(
  startedEvents.map((event) => event.id),
  [1, 2],
  "Events that start before or exactly at the reference time should be marked as started"
);

assert.deepStrictEqual(
  futureEvents.map((event) => event.id),
  [3],
  "Events that start after the reference time should remain in futureEvents"
);

console.log("Event filter checks passed ✅");

