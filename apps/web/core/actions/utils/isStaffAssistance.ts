/**
 * Checks if an action is a staff assistance action based on its type and subType
 * @param action - An object with type and subType properties
 * @returns true if the action is a staff assistance action
 */
export function isStaffAssistance(action: {
  type?: string | null;
  subType?: string | null;
}): boolean {
  const type = action.type?.toUpperCase() || "";
  const subType = action.subType?.toUpperCase() || "";
  
  return (
    type.includes("STAFF") ||
    subType.includes("STAFF") ||
    type.includes("ASSISTANCE")
  );
}

