import axios from 'axios';

// Centralized Backend REST API URL
// Configurable via .env (VITE_API_BASE_URL) with default standard Spring Boot endpoint
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT / Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medqueue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handling, ApiResponse.data unwrap, 401 unauth redirect
api.interceptors.response.use(
  (response) => {
    // If backend uses Spring Boot ApiResponse<T> wrapper { success: true, message: "...", data: ... }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      // Attach full response metadata in case callers need message
      const unwrapped = response.data.data;
      if (unwrapped !== null && typeof unwrapped === 'object') {
        unwrapped.__apiMessage = response.data.message;
      }
      return { ...response, data: unwrapped };
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized handling
      if (error.response.status === 401) {
        console.warn('[API Interceptor] 401 Unauthorized - clearing session');
        localStorage.removeItem('medqueue_token');
        localStorage.removeItem('medqueue_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    } else if (error.request) {
      console.warn('[API Interceptor] Backend server unreachable at ' + BASE_URL);
    }
    return Promise.reject(error);
  }
);

export default api;
