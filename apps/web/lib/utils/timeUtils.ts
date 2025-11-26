const DEFAULT_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DEFAULT_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) {
    return "";
  }

  const date = typeof input === "string" ? new Date(input) : input;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return DEFAULT_DATE_FORMAT.format(date);
}

export function formatTime(hours: number | null | undefined): string {
  if (typeof hours !== "number" || !Number.isFinite(hours)) {
    return "";
  }

  const totalMinutes = Math.round(hours * 60);
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setMinutes(totalMinutes);

  return DEFAULT_TIME_FORMAT.format(baseDate);
}

export function formatTimeFromHHMMSS(
  timeString: string | null | undefined
): string {
  if (!timeString || typeof timeString !== "string") {
    return "";
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    minutes < 0
  ) {
    return "";
  }

  return formatTime(hours + minutes / 60);
}
