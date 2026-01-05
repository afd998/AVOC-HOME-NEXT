export const LECTURE_SERIES_TYPE = "lecture";

export function normalizeSeriesType(seriesType?: string | null): string | null {
  if (typeof seriesType !== "string") return null;
  const normalized = seriesType.trim().toLowerCase();
  return normalized ? normalized : null;
}

export function isLectureSeriesType(seriesType?: string | null): boolean {
  return normalizeSeriesType(seriesType) === LECTURE_SERIES_TYPE;
}

/**
 * Matches the existing calendar lecture rendering behavior:
 * show only the first 8 characters (e.g. "AIML 901") while keeping the full
 * name available via the `title` attribute.
 */
export function truncateLectureSeriesTitle(
  title?: string | null,
  maxChars = 8
): string {
  if (typeof title !== "string") return "";
  if (!Number.isFinite(maxChars) || maxChars <= 0) return "";
  return title.substring(0, maxChars);
}


