import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokenUtils } from '../utils/tokenUtils';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading, setAuthUser } = useAuth();
  const cachedUser = tokenUtils.getUser();
  const token = tokenUtils.getAccessToken();

  const effectiveUser = user || cachedUser;
  const isAuth = isAuthenticated || Boolean(token && effectiveUser);

  // Sync to context if missing in memory state
  React.useEffect(() => {
    if (!user && cachedUser && setAuthUser) {
      setAuthUser(cachedUser);
    }
  }, [user, cachedUser, setAuthUser]);

  // 1. If auth state is initializing/loading, show smooth loading indicator
  if (loading && !effectiveUser && !token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading Student Management System...</span>
        </div>
      </div>
    );
  }

  // 2. If logged out / unauthenticated, redirect directly to /login (no error page)
  if (!isAuth || !effectiveUser) {
    return <Navigate to="/login" replace />;
  }

  // Extract & normalize role string (supports string "FACULTY", "ROLE_FACULTY", or object { roleName: "ROLE_FACULTY" })
  let rawRole = '';
  if (typeof effectiveUser.role === 'string') {
    rawRole = effectiveUser.role;
  } else if (effectiveUser.role?.roleName) {
    rawRole = effectiveUser.role.roleName;
  } else if (effectiveUser.role?.name) {
    rawRole = effectiveUser.role.name;
  } else if (Array.isArray(effectiveUser.roles) && effectiveUser.roles.length > 0) {
    rawRole = typeof effectiveUser.roles[0] === 'string' ? effectiveUser.roles[0] : (effectiveUser.roles[0]?.roleName || effectiveUser.roles[0]?.name || '');
  }

  const userRole = rawRole.replace('ROLE_', '').toUpperCase() || tokenUtils.getRole() || 'ADMIN';
  const normalizedAllowed = allowedRoles.map((r) => r.replace('ROLE_', '').toUpperCase());
  const hasPermission = normalizedAllowed.includes(userRole);

  // 3. If logged in as STUDENT and must change password on first login
  if (userRole === 'STUDENT' && Boolean(effectiveUser?.mustChangePassword)) {
    if (window.location.pathname !== '/student/change-password') {
      return <Navigate to="/student/change-password" replace />;
    }
  }

  // 4. If logged in but route is restricted for current role, automatically redirect to allowed dashboard (NO 403 PAGE)
  if (!hasPermission) {
    if (userRole === 'STUDENT') {
      return <Navigate to={effectiveUser?.mustChangePassword ? "/student/change-password" : "/student/dashboard"} replace />;
    }
    if (userRole === 'FACULTY') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
