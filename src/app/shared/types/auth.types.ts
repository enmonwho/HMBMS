/**
 * Authentication type definitions.
 */

import type { User, Session } from "@supabase/supabase-js";

/** Credentials required for email/password sign-in. */
export interface SignInCredentials {
  email: string;
  password: string;
}

/** Standardized authentication response. */
export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

/** Shape of the useAuth hook return value. */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}
