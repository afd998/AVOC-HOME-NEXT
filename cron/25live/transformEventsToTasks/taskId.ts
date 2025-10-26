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

