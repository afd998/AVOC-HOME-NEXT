/**
 * User profile utility functions
 */

type Profile = {
  id?: string | null;
  name?: string | null;
};

/**
 * Gets a display name for a user profile
 * Priority: name > id (truncated) > "Unknown user"
 * @param profile - The profile object with optional id and name
 * @returns Display name string or null if profile is null/undefined
 */
export function getProfileDisplayName(profile: Profile | null | undefined): string | null {
  if (!profile) {
    return null;
  }

  const name = profile.name?.trim();
  if (name && name.length > 0) {
    return name;
  }

  const id = profile.id?.trim();
  if (id && id.length > 0) {
    return `User ${id.slice(0, 8)}…`;
  }

  return "Unknown user";
}

