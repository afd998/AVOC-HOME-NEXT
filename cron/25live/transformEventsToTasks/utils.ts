import { createHash } from "crypto";

/**
 * Generates a deterministic, safe numeric task ID based on the event id,
 * task type, and start time.
 *
 * The returned number is derived from a SHA-256 hash truncated to 13 hex
 * digits (52 bits) to stay within JavaScript's safe integer range, which
 * maps cleanly to the Drizzle `bigint({ mode: "number" })` column.
 */
export function generateTaskId(
  eventId: number | string,
  taskType: string,
  startTime: string
): number {
  const input = `${eventId}|${taskType}|${startTime}`;
  const hex = createHash("sha256").update(input).digest("hex").slice(0, 13); // 52 bits
  return parseInt(hex, 16);
}

export const adjustTimeByMinutes = (time: string, minuteDelta: number) => {
  const [hoursStr, minutesStr, secondsStr] = time.split(":");
  if (
    hoursStr === undefined ||
    minutesStr === undefined ||
    secondsStr === undefined
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondsStr);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const adjustedSeconds = Math.min(
    Math.max(totalSeconds + minuteDelta * 60, 0),
    24 * 60 * 60 - 1
  );

  const adjustedHours = Math.floor(adjustedSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const adjustedMinutes = Math.floor((adjustedSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const adjustedRemainingSeconds = (adjustedSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${adjustedHours}:${adjustedMinutes}:${adjustedRemainingSeconds}`;
};
