/**
 * ProtectedRoute component.
 *
 * Wraps pages that require authentication. Redirects unauthenticated
 * users to /admin/login. Optionally restricts access by role.
 *
 * Usage:
 *   <Route
 *     path="/admin/dashboard"
 *     element={
 *       <ProtectedRoute>
 *         <DashboardPage />
 *       </ProtectedRoute>
 *     }
 *   />
 *
 *   // With role restriction:
 *   <ProtectedRoute allowedRoles={[UserRole.ADMINISTRATOR]}>
 *     <AdminPage />
 *   </ProtectedRoute>
 */

import type { ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/app/shared/hooks/useAuth";
import { useProfile } from "@/app/shared/hooks/useProfile";
import type { UserRole } from "@/app/shared/types/profile.types";
import { hasAnyRole } from "@/app/shared/types/profile.types";

interface ProtectedRouteProps {
  children?: ReactNode;
  /** Optional list of roles allowed to access this route. */
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);
  const location = useLocation();

  // Wait for auth state to resolve before making a decision
  if (authLoading) {
    return null;
  }

  // Not authenticated → redirect to login, preserving the intended URL
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If role restrictions are specified, wait for the profile to load
  if (allowedRoles) {
    if (profileLoading) {
      return null;
    }

    // User doesn't have the required role → redirect to login
    if (!hasAnyRole(profile, allowedRoles)) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  return <>{children ? children : <Outlet />}</>;
}
