import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/lib/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // Show a debug screen instead of redirecting so we can see what's wrong
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied (Debug)</h2>
          <p className="text-slate-700 mb-4">You do not have permission to view this page.</p>
          <div className="bg-slate-100 p-4 rounded text-sm font-mono mb-4 overflow-auto">
            <p><strong>Your Email:</strong> {session.user?.email || 'N/A'}</p>
            <p><strong>Your Role:</strong> {role || 'null'}</p>
            <p><strong>Allowed Roles:</strong> {allowedRoles.join(', ')}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
