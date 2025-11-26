/**
 * Adjusts a time string (HH:MM or HH:MM:SS) by a given number of minutes.
 * Returns a time string in HH:MM:SS format, clamped to [00:00:00, 23:59:59].
 */
export const adjustTimeByMinutes = (
  time: string,
  minuteDelta: number | string
): string => {
  const parts = time.split(":");
  if (parts.length < 2 || parts.length > 3) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const [hoursStr, minutesStr, secondsStr = "0"] = parts;
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondsStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const minuteDeltaNumber =
    typeof minuteDelta === "string" ? Number(minuteDelta) : minuteDelta;
  if (Number.isNaN(minuteDeltaNumber)) {
    throw new Error(`Invalid minute delta: ${minuteDelta}`);
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const deltaSeconds = Math.round(minuteDeltaNumber * 60);
  const adjustedSeconds = Math.min(
    Math.max(totalSeconds + deltaSeconds, 0),
    24 * 60 * 60 - 1
  );

  const adjustedHours = Math.floor(adjustedSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const adjustedMinutes = Math.floor((adjustedSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const adjustedRemainingSeconds = Math.floor(adjustedSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${adjustedHours}:${adjustedMinutes}:${adjustedRemainingSeconds}`;
};

