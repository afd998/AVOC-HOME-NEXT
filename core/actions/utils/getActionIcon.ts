import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

export function getActionIcon(action: HydratedAction): string {
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
    return "mdi:account-group";
  }

  return "mdi:check-circle";
}

