import { createHash } from "crypto";

const DEFAULT_HEX_LENGTH = 13; // 52 bits, safe within JS number range

/**
 * Generates a deterministic numeric identifier from an arbitrary input string.
 * The identifier is derived from a SHA-256 hash truncated to a configurable
 * number of hex digits (default 13), keeping the result within JavaScript's
 * safe integer range.
 */
export function generateDeterministicId(
  input: string,
  hexLength: number = DEFAULT_HEX_LENGTH
): number {
  if (!Number.isInteger(hexLength)) {
    throw new Error(`hexLength must be an integer. Received: ${hexLength}`);
  }

  if (hexLength <= 0 || hexLength > DEFAULT_HEX_LENGTH) {
    throw new Error(
      `hexLength must be between 1 and ${DEFAULT_HEX_LENGTH} to stay within the safe integer range. Received: ${hexLength}`
    );
  }

  if (input.length === 0) {
    throw new Error("Input must be a non-empty string.");
  }

  const hex = createHash("sha256").update(input).digest("hex").slice(0, hexLength);
  return parseInt(hex, 16);
}

/**
 * Builds the canonical task identifier string used to derive deterministic IDs.
 */
export function composeActionIdInput(
  eventId: number | string,
  taskType: string,
  startTime: string
): string {
  return `${eventId}|${taskType}|${startTime}`;
}

