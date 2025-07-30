// src/Utils/AxioxInstance.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://sportapi.tracewavetransparency.com/api/v1/admin';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'api-key': 'game@tracewave',
    platform: 'AnDroId@Trace',
    'is-encript': 'false',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const logoutAndRedirect = () => {
  toast.error('Session expired. Please login again.');
  localStorage.clear();
  window.location.href = '/';
};

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  response => {
    // Handle custom token expiration codes in successful responses
    if (response?.data?.code === -1 && response?.data?.message === 'Invalid or expired token') {
      // Simulate error so the retry logic below kicks in
      const error = new Error('Access token expired');
      error.config = response.config;
      throw error;
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (originalRequest?._retry) return Promise.reject(error);

    const responseMessage = error?.response?.data?.message;
    const responseCode = error?.response?.data?.code;

    if (
      responseMessage === 'Token is required' ||
      responseMessage === 'Invalid or expired token' ||
      responseCode === -1
    ) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['token'] = token;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh_token`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': 'game@tracewave',
              platform: 'AnDroId@Trace',
              'is-encript': 'false',
            },
          }
        );

        const { access_token } = res?.data?.data;

        if (!access_token) {
          throw new Error('No access token in response');
        }

        localStorage.setItem('token', access_token);
        axiosInstance.defaults.headers['token'] = access_token;
        processQueue(null, access_token);

        originalRequest.headers['token'] = access_token;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logoutAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
