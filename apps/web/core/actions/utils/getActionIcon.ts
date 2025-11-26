import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

/**
 * Gets the icon name for an action based on its type and subType
 * @param action - An object with type and subType properties
 * @returns The iconify icon name
 */
export function getActionIcon(action: {
  type?: string | null;
  subType?: string | null;
}): string {
  const type = action.type?.toUpperCase() || "";
  const subType = action.subType?.toUpperCase() || "";

  if (type.includes("CONFIG") || subType.includes("CONFIG")) {
    return "mdi:cog";
  }
  if (
    type.includes("CAPTURE") ||
    subType.includes("CAPTURE") ||
    type.includes("RECORDING")
  ) {
    return "mdi:video";
  }
  if (
    type.includes("STAFF") ||
    subType.includes("STAFF") ||
    type.includes("ASSISTANCE")
  ) {
    return "mdi:walk";
  }

  return "mdi:check-circle";
}

