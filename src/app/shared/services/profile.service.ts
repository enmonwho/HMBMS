/**
 * Profile service.
 *
 * Fetches profile data from the `profiles` table.
 * Requires the user to be authenticated — the profile row
 * is looked up by the auth user's `id`.
 */

import { supabase } from "@/app/shared/lib/supabase";
import type { Profile } from "@/app/shared/types/profile.types";

// ─── Custom Error ───────────────────────────────────────────────────

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileError";
  }
}

// ─── Service Functions ──────────────────────────────────────────────

/**
 * Fetch the profile for the currently authenticated user.
 *
 * @throws {ProfileError} If no user is signed in, the profile doesn't exist,
 *         or the query fails.
 */
export async function getCurrentProfile(): Promise<Profile> {
  // 1. Resolve the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new ProfileError(userError.message);
  }

  if (!user) {
    throw new ProfileError("No authenticated user found.");
  }

  // 2. Query the profiles table
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role, is_active, created_at")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new ProfileError(error.message);
  }

  if (!data) {
    throw new ProfileError("Profile not found for current user.");
  }

  return data as Profile;
}
