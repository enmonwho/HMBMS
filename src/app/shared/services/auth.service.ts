/**
 * Authentication service.
 *
 * Thin wrapper around Supabase Auth that provides a clean,
 * application-specific API. All methods return typed results
 * and throw `AuthError` on failure so callers can handle
 * errors consistently.
 */

import { supabase } from "@/app/shared/lib/supabase";
import type { AuthResponse } from "@/app/shared/types/auth.types";

// ─── Custom Error ───────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// ─── Service Functions ──────────────────────────────────────────────

/**
 * Sign in a user with email and password.
 *
 * @throws {AuthError} If Supabase returns an error (e.g. invalid credentials).
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AuthError(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Sign out the current user and clear the session.
 *
 * @throws {AuthError} If sign-out fails.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthError(error.message);
  }
}

/**
 * Retrieve the currently authenticated user from the session.
 * Returns `null` if no user is signed in.
 *
 * @throws {AuthError} If the request fails (network error, etc.).
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new AuthError(error.message);
  }

  return user;
}

/**
 * Retrieve the current session.
 * Returns `null` if no active session exists.
 *
 * @throws {AuthError} If the request fails.
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new AuthError(error.message);
  }

  return session;
}

/**
 * Send a password-reset email to the given address.
 *
 * @throws {AuthError} If the request fails.
 */
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    throw new AuthError(error.message);
  }
}
