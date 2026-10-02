import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';
import apiCache from '../utils/apiCache';
import dataSync from '../utils/dataSync';
import toast from '../utils/toastService';

const rawEnvUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();

export const getNormalizedApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined';
  const isLocalHost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

  // If running locally in browser
  if (isLocalHost) {
    if (rawEnvUrl && rawEnvUrl.includes('localhost')) {
      let clean = rawEnvUrl.replace(/\/+$/, '');
      if (!clean.endsWith('/api')) clean += '/api';
      return clean;
    }
    return 'http://localhost:8080/api';
  }

  // If running in production (Vercel, mobile browser, custom domain)
  if (rawEnvUrl && !rawEnvUrl.includes('localhost') && !rawEnvUrl.includes('127.0.0.1')) {
    let clean = rawEnvUrl.replace(/\/+$/, '');
    if (!clean.endsWith('/api')) clean += '/api';
    return clean;
  }

  // Fallback to deployed production backend on Render
  return 'https://studnetmanagament-systembackend.onrender.com/api';
};

export const API_BASE_URL = getNormalizedApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const pendingRequests = new Map();

const getRequestCacheKey = (method, url, config = {}) => {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${method.toUpperCase()}:${url}:${params}`;
};

const getRequestCacheTtl = (config = {}) => {
  if (typeof config?.cacheTTL === 'number') return config.cacheTTL;
  if (typeof config?.ttl === 'number') return config.ttl;
  return 30000;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20-second timeout to prevent indefinite hangs on mobile networks
});

// Dynamic base URL guard interceptor
api.interceptors.request.use((config) => {
  const currentBaseUrl = getNormalizedApiBaseUrl();
  config.baseURL = currentBaseUrl;
  return config;
});

export const warmupServer = () => {
  api.get('/health', { timeout: 8000, cache: false })
    .then(() => console.log('>>> [WARMUP] Backend server is active.'))
    .catch(() => console.log('>>> [WARMUP] Backend warming up...'));
};

export const clearApiCacheAndPending = () => {
  apiCache.clear();
  pendingRequests.clear();
};

api.get = function getWithCaching(url, config = {}) {
  const shouldCache = config?.cache !== false;
  // If caching is disabled or an AbortSignal is attached, bypass cache and in-flight deduplication
  if (!shouldCache || config?.signal) {
    return api.request({ ...config, method: 'get', url });
  }

  const requestKey = getRequestCacheKey('get', url, config);
  const cached = apiCache.get(requestKey);

  if (cached) {
    return Promise.resolve({
      data: cached,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { ...config, url, method: 'get' },
      request: {},
    });
  }

  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const requestPromise = api.request({ ...config, method: 'get', url })
    .then((response) => {
      apiCache.set(requestKey, response.data, getRequestCacheTtl(config));
      pendingRequests.delete(requestKey);
      return response;
    })
    .catch((error) => {
      pendingRequests.delete(requestKey);
      throw error;
    });

  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
};

// Request Interceptor: Attach Bearer Access Token & Timing Logs
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    console.log(`>>> [API START] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.url && config.url.startsWith('/') && config.baseURL && config.baseURL.endsWith('/api')) {
      config.url = config.url.replace(/^\//, '');
    }
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Silent Refresh Token Rotation
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getMutationScopes = (url = '') => {
  const scopes = new Set(['dashboard']);
  if (url.includes('/students')) scopes.add('students');
  if (url.includes('/documents') || url.includes('/document-types')) scopes.add('certificates');
  if (url.includes('/faculty')) scopes.add('faculty');
  if (url.includes('/academic/sections')) {
    scopes.add('sections');
    scopes.add('students');
    scopes.add('faculty');
  }
  if (url.includes('/academic/groups')) {
    scopes.add('groups');
    scopes.add('sections');
  }
  if (url.includes('/users') || url.includes('/roles')) scopes.add('users');
  return [...scopes];
};

const getOperationMessage = (url = '', method = 'post', failed = false) => {
  const action = method.toLowerCase();
  if (url.includes('/auth/')) {
    if (url.includes('login') || url.includes('google')) return failed ? 'Login failed. Please check your credentials.' : 'Logged in successfully.';
    if (url.includes('logout')) return failed ? 'Logout failed.' : 'Logout successful.';
    if (url.includes('verify')) return failed ? 'Verification failed. Please try again.' : 'Verification successful.';
    if (url.includes('send') || url.includes('resend') || url.includes('otp')) return failed ? 'Failed to send verification code.' : 'Verification code sent successfully.';
    return failed ? 'Authentication failed.' : 'Success.';
  }
  if (url.includes('/profile/change-password') || url.includes('/reset-password')) return failed ? 'Failed to change password.' : 'Password changed successfully.';
  if (url.includes('/students')) {
    if (url.includes('/photo')) return failed ? 'Failed to update student.' : 'Profile updated successfully.';
    if (action === 'post') return failed ? 'Failed to add student.' : 'Student added successfully.';
    if (action === 'delete') return failed ? 'Failed to delete student.' : 'Student deleted successfully.';
    return failed ? 'Failed to update student.' : 'Student updated successfully.';
  }
  if (url.includes('/documents')) {
    if (url.includes('/verify')) return failed ? 'Failed to verify certificate.' : 'Certificate verified successfully.';
    if (url.includes('/reject')) return failed ? 'Failed to reject certificate.' : 'Certificate rejected successfully.';
    if (url.includes('/replace')) return failed ? 'Failed to update certificate.' : 'Certificate updated successfully.';
    if (action === 'delete') return failed ? 'Failed to delete certificate.' : 'Certificate deleted successfully.';
    return failed ? 'Failed to upload certificate.' : 'Certificate uploaded successfully.';
  }
  if (url.includes('/faculty')) {
    if (url.includes('/assignments')) return failed ? 'Failed to assign faculty.' : 'Faculty assigned successfully.';
  }
  if (url.includes('/academic/sections')) {
    if (url.includes('/assign')) return failed ? 'Failed to assign student.' : 'Student assigned successfully.';
    if (url.includes('/members') || url.includes('/remove-students')) return failed ? 'Failed to unassign student.' : 'Student unassigned successfully.';
    if (action === 'post') return failed ? 'Failed to create section.' : 'Section created successfully.';
    if (action === 'delete') return failed ? 'Failed to delete section.' : 'Section deleted successfully.';
    return failed ? 'Failed to update section.' : 'Section updated successfully.';
  }
  if (url.includes('/academic/groups')) {
    if (action === 'post') return failed ? 'Failed to create group.' : 'Group created successfully.';
    if (action === 'delete') return failed ? 'Failed to delete group.' : 'Group deleted successfully.';
    return failed ? 'Failed to update group.' : 'Group updated successfully.';
  }
  return failed ? 'Database operation failed.' : 'Data saved successfully.';
};

api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config?.metadata?.startTime || Date.now());
    console.log(`>>> [API END] ${response.config?.method?.toUpperCase()} ${response.config?.url} (${duration}ms)`);
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || '';
    if (['post', 'put', 'patch', 'delete'].includes(method) && !url.includes('/auth/')) {
      toast.success(getOperationMessage(url, method), { operation: `${method}:${url}` });
    }
    if (['post', 'put', 'patch', 'delete'].includes(method) && !url.startsWith('/auth/')) {
      // Cached GET payloads are never allowed to outlive a successful write.
      apiCache.clear();
      dataSync.invalidate(getMutationScopes(url));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const duration = Date.now() - (originalRequest?.metadata?.startTime || Date.now());
    console.warn(`>>> [API ERROR] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms):`, error.message);
    const method = originalRequest?.method?.toLowerCase();
    const url = originalRequest?.url || '';

    // Handle 401 Unauthorized with Refresh Token rotation
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (url.includes('/auth/') || url.includes('/reset-password')) {
        if (!url.includes('/auth/refresh') && !url.includes('/auth/admin/login') && !url.includes('/auth/faculty/login') && !url.includes('/auth/student/login') && !url.includes('/auth/login') && !url.includes('/auth/verify')) {
          toast.error(getOperationMessage(url, method, true), { operation: `error:${method}:${url}` });
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenUtils.getRefreshToken();

      if (!refreshToken) {
        tokenUtils.clearAuth();
        toast.error('Session expired. Please login again.', { operation: `error:${method}:${url}` });
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = response.data;

        tokenUtils.saveAuth({ accessToken, refreshToken: newRefreshToken, user });

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenUtils.clearAuth();
        toast.error('Session expired. Please login again.', { operation: `error:${method}:${url}` });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Attach friendly timeout message
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || (!error.response && error.request)) {
      error.customMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Other non-401 errors
    const isAuthRoute = url.includes('/auth/admin/login') || url.includes('/auth/faculty/login') || url.includes('/auth/student/login') || url.includes('/auth/login') || url.includes('/auth/verify') || url.includes('/auth/refresh');
    if (!isAuthRoute) {
      if (error.response?.status === 403) {
        toast.error('Unauthorized access.', { operation: `error:${method}:${url}` });
      } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
        const errorMsg = error.customMessage || getOperationMessage(url, method, true);
        toast.error(errorMsg, { operation: `error:${method}:${url}` });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
