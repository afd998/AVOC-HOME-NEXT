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

  let date: Date;
  if (typeof input === "string") {
    // Parse YYYY-MM-DD as local date to avoid UTC interpretation issues
    const dateMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch.map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(input);
    }
  } else {
    date = input;
  }

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
