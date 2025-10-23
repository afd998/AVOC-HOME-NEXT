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
