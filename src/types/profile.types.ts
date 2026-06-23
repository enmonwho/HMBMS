/**
 * Profile and role type definitions.
 */

/**
 * All valid user roles in the system.
 * Must match the `role` column values in the `profiles` table.
 *
 * Uses a const object instead of an enum because the project has
 * `erasableSyntaxOnly` enabled (enums emit runtime code).
 */
export const UserRole = {
  ADMINISTRATOR: "ADMINISTRATOR",
  COORDINATOR: "COORDINATOR",
  NURSE: "NURSE",
  ATTENDANT: "ATTENDANT",
  MIDWIFE: "MIDWIFE",
  MEDICAL_TECHNOLOGIST: "MEDICAL_TECHNOLOGIST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Profile record from the `profiles` table. */
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

/** Shape of the useProfile hook return value. */
export interface ProfileState {
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
}

// ─── Role Helpers ───────────────────────────────────────────────────

/**
 * Check if a profile has a specific role.
 *
 * @param profile - The user profile (or null if not loaded).
 * @param role    - The role to check against.
 * @returns `true` if the profile's role matches.
 */
export function hasRole(profile: Profile | null, role: UserRole): boolean {
  if (!profile) return false;
  return profile.role === role;
}

/**
 * Check if a profile has any of the given roles.
 *
 * @param profile - The user profile (or null if not loaded).
 * @param roles   - An array of acceptable roles.
 * @returns `true` if the profile's role is in the list.
 */
export function hasAnyRole(
  profile: Profile | null,
  roles: ReadonlyArray<UserRole>
): boolean {
  if (!profile) return false;
  return roles.includes(profile.role);
}
