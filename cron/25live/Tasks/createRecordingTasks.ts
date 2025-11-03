const THIRTY_MINUTES_IN_SECONDS = 30 * 60;
import { tasks } from "../../../drizzle/schema";
import { InferInsertModel } from "drizzle-orm";
import { type ProcessedEvent, type EventResource } from "../Events/transformRawEventsToEvents";
import { generateTaskId } from "./utils";
/**
 * Convert a HH:MM[:SS] string into seconds from midnight.
 * @param {string} timeStr
 * @returns {number|null}
 */

type TaskRow = InferInsertModel<typeof tasks>;
const parseTimeToSeconds = (timeStr: string) => {
  if (typeof timeStr !== "string") {
    return null;
  }

  const parts = timeStr.split(":").map((part) => Number(part));

  if (parts.some(Number.isNaN)) {
    return null;
  }

  const [hours = 0, minutes = 0, seconds = 0] = parts;
  return hours * 3600 + minutes * 60 + Math.floor(seconds);
};
/**
 * Convert seconds from midnight into a HH:MM:SS string.
 * @param {number} totalSeconds
 * @returns {string}
 */
const formatSecondsToTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

/**
 * Create Panopto recording check tasks for events with video recording resources.
 * Mirrors the behaviour of the SQL trigger by emitting 30 minute interval checks.
 * @param {Object} event
 * @param {Object} resource
 * @returns {Array<Object>}
 */
export function createRecordingTasks(event: ProcessedEvent, resource: EventResource) {
  if (!event || !resource) {
    return [];
  }

  const resourceName = resource.itemName || "";
  const hasVideoRecordingResource = resourceName
    .toUpperCase()
    .startsWith("KSM-KGH-VIDEO-RECORDING");

  if (!hasVideoRecordingResource) {
    return [];
  }

  const startSeconds = parseTimeToSeconds(event.startTime);
  const endSeconds = parseTimeToSeconds(event.endTime);

  if (startSeconds === null || endSeconds === null) {
    return [];
  }

  const durationSeconds = endSeconds - startSeconds;
  if (durationSeconds <= 0) {
    return [];
  }

  const totalChecks = Math.floor(durationSeconds / THIRTY_MINUTES_IN_SECONDS);
  if (totalChecks <= 0) {
    return [];
  }

  const tasks: TaskRow[] = [];
  for (let index = 0; index < totalChecks; index += 1) {
    const checkSeconds = startSeconds + index * THIRTY_MINUTES_IN_SECONDS;

    const taskType = "RECORDING CHECK" as const;
    const startTime = formatSecondsToTime(checkSeconds);

    tasks.push({
      id: generateTaskId(event.id, taskType, startTime),
      taskType: "RECORDING CHECK",
      date: event.date,
      startTime,
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      resource: resourceName,
      room: event.roomName,
      taskDict: "RECORDING CHECK"
    });
  }

  return tasks;
}
