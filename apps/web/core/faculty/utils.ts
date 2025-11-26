// Server-safe type for faculty items (subset of FacultyAvatarItem)
export interface FacultyItem {
  displayName?: string | null;
  twentyfiveliveName?: string | null;
  twentyfivelive_name?: string | null;
  kelloggdirectoryName?: string | null;
  kelloggdirectory_name?: string | null;
}

// Server-safe helper function
function pickFirstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return "";
}

// Server-safe function to get display name from a faculty item
export function getFacultyDisplayNameServer(
  faculty?: FacultyItem | null
): string {
  if (!faculty) return "";
  return pickFirstNonEmpty(
    faculty.displayName,
    faculty.kelloggdirectoryName,
    faculty.kelloggdirectory_name,
    faculty.twentyfiveliveName,
    faculty.twentyfivelive_name
  );
}

// Server-safe function to get display names from faculty array
export function getFacultyDisplayNamesServer(
  faculty: FacultyItem[],
  options?: {
    fallbackNames?: Array<string | null | undefined>;
    max?: number;
  }
): string[] {
  const fallbackList =
    options?.fallbackNames?.map((name) =>
      typeof name === "string" ? name.trim() : ""
    ) ?? [];

  const computed = faculty.map((member, index) => {
    const direct = getFacultyDisplayNameServer(member);
    if (direct) return direct;

    const fallback = fallbackList[index];
    if (fallback) return fallback;
    return "";
  });

  let normalized = computed.filter(Boolean);

  if (normalized.length === 0 && fallbackList.length > 0) {
    normalized = fallbackList.filter(Boolean);
  } else if (fallbackList.length > normalized.length) {
    fallbackList.slice(normalized.length).forEach((name) => {
      if (name) {
        normalized.push(name);
      }
    });
  }

  if (options?.max !== undefined) {
    return normalized.slice(0, options.max);
  }

  return normalized;
}

// Helper function to extract last names from instructor names
export const extractLastNames = (
  instructorNames: Array<string | null | undefined>
): string => {
  return instructorNames
    .map((name) => {
      const trimmedName = (name ?? "").trim();
      if (!trimmedName) {
        return "";
      }

      // TwentyFiveLive names use "Last, First" format; prefer the segment before the comma.
      const commaIndex = trimmedName.indexOf(",");
      if (commaIndex >= 0) {
        const lastName = trimmedName.slice(0, commaIndex).trim();
        if (lastName) {
          return lastName;
        }
      }

      // Fallback to the last whitespace-delimited token (covers "First Last" and similar formats).
      const nameParts = trimmedName.split(/\s+/);
      return nameParts[nameParts.length - 1] || trimmedName;
    })
    .filter(Boolean)
    .join(", ");
};
