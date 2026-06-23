/**
 * useAuth hook.
 *
 * Manages authentication state by subscribing to Supabase's
 * `onAuthStateChange` listener. Provides the current user, session,
 * and loading flag, plus signIn / signOut actions.
 *
 * Usage:
 *   const { user, session, loading, signIn, signOut } = useAuth();
 */

import { useState, useEffect, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  signIn as authSignIn,
  signOut as authSignOut,
} from "@/services/auth.service";
import type { AuthResponse } from "@/types/auth.types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hydrate with the existing session (page refresh, tab restore, etc.)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Subscribe to future auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /** Sign in and let the auth listener update state automatically. */
  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      return authSignIn(email, password);
    },
    []
  );

  /** Sign out and let the auth listener clear state automatically. */
  const signOut = useCallback(async (): Promise<void> => {
    return authSignOut();
  }, []);

  return { user, session, loading, signIn, signOut };
}
