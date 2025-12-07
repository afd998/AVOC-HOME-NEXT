import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

export type ActionIconConfig = {
  icon: string;
  colorClass: string;
};

/**
 * Gets the icon and default color for an action based on its type and subType
 * @param action - An object with type and subType properties
 */
export function getActionIconConfig(action: {
  type?: string | null;
  subType?: string | null;
}): ActionIconConfig {
  const type = (action.type ?? "").toString().toUpperCase().trim();
  const subType = (action.subType ?? "").toString().toUpperCase().trim();

  if (type === "CONFIG" && subType === "SET") {
    return { icon: "gg:row-first", colorClass: "text-green-600" };
  }
  if (subType === "STRIKE") {
    return { icon: "gg:row-last", colorClass: "text-green-600" };
  }

  if (type.includes("CAPTURE QC") || subType.includes("CAPTURE QC")) {
    return { icon: "jam:eye-f", colorClass: "text-purple-600" };
  }
  if (
    type.includes("STAFF") ||
    subType.includes("STAFF") ||
    type.includes("ASSISTANCE")
  ) {
    return { icon: "ri:chat-smile-fill", colorClass: "text-blue-600" };
  }
  if (type.includes("CONFIG") || subType.includes("CONFIG")) {
    return { icon: "mdi:walk", colorClass: "text-green-600" };
  }
  if (
    type.includes("CAPTURE") ||
    subType.includes("CAPTURE") ||
    type.includes("RECORDING")
  ) {
    return { icon: "mdi:video", colorClass: "text-muted-foreground" };
  }

  return { icon: "mdi:check-circle", colorClass: "text-muted-foreground" };
}

// Backwards-compatible helper for callers that only need the icon name
export function getActionIcon(action: {
  type?: string | null;
  subType?: string | null;
}): string {
  return getActionIconConfig(action).icon;
}
