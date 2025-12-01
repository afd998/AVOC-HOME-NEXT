/**
 * Date and time formatting utilities for Supabase date/time types
 * Works with PostgreSQL date, time, and timestamp columns
 */

// Use explicit locale to prevent hydration mismatches between server and client
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
});

const numericDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Formats a PostgreSQL date string (YYYY-MM-DD) to a human-readable format
 * @param value - Date string in YYYY-MM-DD format
 * @returns Formatted date string or "No date" if invalid/empty
 */
export function formatDate(value: string) {
  if (!value) {
    return "No date";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
}

/**
 * Formats a PostgreSQL date string as MM/DD/YYYY
 * @param value - Date string in YYYY-MM-DD format
 * @returns Formatted date string or "No date" if invalid/empty
 */
export function formatDateNumeric(value: string) {
  if (!value) {
    return "No date";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return numericDateFormatter.format(date);
}

/**
 * Formats a PostgreSQL time string (HH:MM:SS or HH:MM) to a human-readable format
 * @param value - Time string in HH:MM:SS or HH:MM format
 * @returns Formatted time string or original value if invalid
 */
export function formatTime(value: string) {
  const [hour, minute] = value.split(":");
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);
  if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
    return value;
  }
  const date = new Date();
  date.setHours(parsedHour, parsedMinute, 0, 0);
  return timeFormatter.format(date);
}

/**
 * Formats a PostgreSQL timestamp string to a human-readable date-time format
 * @param value - Timestamp string (ISO 8601 format)
 * @returns Formatted date-time string or "Unknown" if invalid/empty
 */
export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}
