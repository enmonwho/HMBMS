/**
 * useProfile hook.
 *
 * Automatically fetches the current user's profile whenever
 * the authenticated user changes. Returns the profile, the
 * resolved role, and a loading flag.
 *
 * Usage:
 *   const { profile, role, loading } = useProfile(user);
 */

import { useState, useEffect, useRef, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/app/shared/services/profile.service";
import type { Profile, UserRole } from "@/app/shared/types/profile.types";

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(!!user);

  // Track the previous user ID so we can detect changes synchronously
  const prevUserIdRef = useRef<string | null>(user?.id ?? null);

  // Derive whether we need to reset — this runs during render, not in an effect
  const needsReset = useMemo(() => {
    const currentUserId = user?.id ?? null;
    const prevUserId = prevUserIdRef.current;

    if (currentUserId !== prevUserId) {
      prevUserIdRef.current = currentUserId;
      return true;
    }

    return false;
  }, [user]);

  // Reset state synchronously during render (not in an effect) when user changes
  if (needsReset && !user) {
    // These are conditional setState calls during render which React handles
    // correctly — it will discard the in-progress render and re-render with
    // the new state. This avoids the "setState in effect" lint error.
    if (profile !== null) setProfile(null);
    if (role !== null) setRole(null);
    if (loading) setLoading(false);
  }

  if (needsReset && user) {
    if (profile !== null) setProfile(null);
    if (role !== null) setRole(null);
    if (!loading) setLoading(true);
  }

  useEffect(() => {
    // No user → nothing to fetch
    if (!user) return;

    let cancelled = false;

    async function fetchProfile() {
      try {
        const data = await getCurrentProfile();

        if (!cancelled) {
          setProfile(data);
          setRole(data.role);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setRole(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    // Cleanup: ignore stale responses if the user changes quickly
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, role, loading };
}
