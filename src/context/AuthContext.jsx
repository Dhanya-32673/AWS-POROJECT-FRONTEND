import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenUtils } from '../utils/tokenUtils';
import SessionTimeoutModal from '../components/common/SessionTimeoutModal';
import toast from '../utils/toastService';

import { clearApiCacheAndPending } from '../services/api';

const AuthContext = createContext(null);

// Inactivity Threshold Constants
const WARNING_TIMEOUT_MS = 55 * 60 * 1000; // 55 minutes of inactivity before warning modal
const WARNING_DURATION_SECONDS = 5 * 60;   // 5 minutes (300s) countdown inside modal
const TOTAL_TIMEOUT_MS = 60 * 60 * 1000;   // 60 minutes total auto-logout threshold
const THROTTLE_MS = 3000;                  // Throttle user activity events to once per 3s

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(tokenUtils.getUser());
  const [loading, setLoading] = useState(true);
  const [isInactiveLoggedOut, setIsInactiveLoggedOut] = useState(false);

  // Inactivity & Modal State
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION_SECONDS);

  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // Initialize BroadcastChannel for Multi-Tab Sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sicms_session_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data === 'SESSION_LOGOUT') {
          handleAutoLogout(true);
        } else if (event.data === 'ACTIVITY_RESET') {
          resetInactivityTimer(false);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  const handleAutoLogout = useCallback((isRemote = false) => {
    tokenUtils.clearAuth();
    setUser(null);
    setShowWarningModal(false);
    setIsInactiveLoggedOut(true);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    if (!isRemote && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage('SESSION_LOGOUT');
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }
  }, []);

  const resetInactivityTimer = useCallback((broadcast = true) => {
    lastActivityRef.current = Date.now();

    if (showWarningModal) {
      setShowWarningModal(false);
      setSecondsRemaining(WARNING_DURATION_SECONDS);
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    if (broadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage('ACTIVITY_RESET');
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }

    // Schedule 55-minute warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarningModal(true);
      setSecondsRemaining(WARNING_DURATION_SECONDS);

      // Start 5-minute countdown clock
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleAutoLogout(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_TIMEOUT_MS);
  }, [showWarningModal, handleAutoLogout]);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenUtils.getAccessToken();
      const cachedUser = tokenUtils.getUser();

      if (token) {
        if (cachedUser) {
          setUser(cachedUser);
          resetInactivityTimer(false);
        }
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            tokenUtils.setUser(currentUser);
            resetInactivityTimer(false);
          }
        } catch (error) {
          if (!cachedUser) {
            tokenUtils.clearAuth();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [resetInactivityTimer]);

  // Global User Activity Listeners
  useEffect(() => {
    if (!user) return;

    let lastThrottledTime = 0;

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledTime > THROTTLE_MS) {
        lastThrottledTime = now;
        if (!showWarningModal) {
          resetInactivityTimer(true);
        }
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [user, showWarningModal, resetInactivityTimer]);

  const setAuthUser = useCallback((userData) => {
    if (userData) {
      setUser(userData);
      tokenUtils.setUser(userData);
      resetInactivityTimer(true);
    }
  }, [resetInactivityTimer]);

  const login = async (email, password) => {
    setIsInactiveLoggedOut(false);
    return await authService.login(email, password);
  };

  const adminVerifyOtp = async (email, otp) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.verifyAdminOtp(email, otp);
    const resolvedUser = data?.user || tokenUtils.getUser() || { email, role: 'ADMIN' };
    setUser(resolvedUser);
    tokenUtils.setUser(resolvedUser);
    resetInactivityTimer(true);
    return data;
  };

  const studentLogin = async (email, password) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.studentLogin(email, password);
    const resolvedUser = data?.user || tokenUtils.getUser() || { email, role: 'STUDENT' };
    setUser(resolvedUser);
    tokenUtils.setUser(resolvedUser);
    resetInactivityTimer(true);
    return data;
  };

  const facultyLogin = async (email, password) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.facultyLogin(email, password);
    const resolvedUser = data?.user || tokenUtils.getUser() || { email, role: 'FACULTY' };
    setUser(resolvedUser);
    tokenUtils.setUser(resolvedUser);
    resetInactivityTimer(true);
    return data;
  };

  const googleLogin = async (idToken) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.googleLogin(idToken);
    const resolvedUser = data?.user || tokenUtils.getUser();
    if (resolvedUser) {
      setUser(resolvedUser);
      tokenUtils.setUser(resolvedUser);
    }
    resetInactivityTimer(true);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    setIsInactiveLoggedOut(false);
    const data = await authService.verifyOtp(email, otp);
    const resolvedUser = data?.user || tokenUtils.getUser() || { email };
    setUser(resolvedUser);
    tokenUtils.setUser(resolvedUser);
    resetInactivityTimer(true);
    return data;
  };

  const logout = async () => {
    setIsInactiveLoggedOut(false);
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage('SESSION_LOGOUT');
      } catch (err) {
        console.warn('BroadcastChannel notice:', err);
      }
    }
    await authService.logout();
    clearApiCacheAndPending();
    tokenUtils.clearAuth();
    setUser(null);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    toast.success('Logout successful.', { operation: 'local:logout' });
  };

  const effectiveUser = user || tokenUtils.getUser();
  const userRole = tokenUtils.getRole() || (effectiveUser ? (typeof effectiveUser.role === 'string' ? effectiveUser.role.replace(/^ROLE_/i, '').toUpperCase() : effectiveUser.role?.roleName?.replace(/^ROLE_/i, '').toUpperCase()) : '');
  const hasToken = Boolean(tokenUtils.getAccessToken());

  const value = React.useMemo(() => ({
    user: effectiveUser,
    loading,
    isAuthenticated: Boolean(effectiveUser || hasToken),
    role: userRole,
    isAdmin: userRole === 'ADMIN',
    isFaculty: userRole === 'FACULTY',
    isStudent: userRole === 'STUDENT',
    isInactiveLoggedOut,
    clearInactivityNotice: () => setIsInactiveLoggedOut(false),
    setAuthUser,
    login,
    adminVerifyOtp,
    studentLogin,
    facultyLogin,
    googleLogin,
    verifyOtp,
    logout,
    resetInactivityTimer: () => resetInactivityTimer(true),
  }), [
    effectiveUser,
    loading,
    hasToken,
    userRole,
    isInactiveLoggedOut,
    setAuthUser,
    login,
    adminVerifyOtp,
    studentLogin,
    facultyLogin,
    googleLogin,
    verifyOtp,
    logout,
    resetInactivityTimer,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}

      {/* Global Session Timeout Warning Modal */}
      {showWarningModal && (
        <SessionTimeoutModal
          secondsRemaining={secondsRemaining}
          onStayLoggedIn={() => resetInactivityTimer(true)}
          onLogoutNow={() => handleAutoLogout(false)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
