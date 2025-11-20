const THIRTY_MINUTES_IN_SECONDS = 30 * 60;
import {
  type ProcessedEvent,
  type EventResource,
  type EventRecordingRow,
} from "../../../lib/db/types";
import { generateDeterministicId } from "../utils";
import { composeActionIdInput } from "./utils";
import { type ActionRow } from "../../../lib/db/types";
/**
 * Convert a HH:MM[:SS] string into seconds from midnight.
 * @param {string} timeStr
 * @returns {number|null}
 */

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
export function makeCaptureQCActions(   
  event: ProcessedEvent,
  eventRecordingRow: EventRecordingRow | undefined
) {
 
  if (!eventRecordingRow) {
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

  const actions: ActionRow[] = [];
  for (let index = 0; index < totalChecks; index += 1) {
    const checkSeconds = startSeconds + index * THIRTY_MINUTES_IN_SECONDS;
    const startTime = formatSecondsToTime(checkSeconds);

    actions.push({
      id: generateDeterministicId(
        composeActionIdInput(event.id, "CAPTURE QC", startTime)
      ),
      type: "CAPTURE QC",
      startTime,
      createdAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
      completedBy: null,
      event: event.id,
      subType: null, 
      source: "25Live",
    });
  }

  return actions;
}
