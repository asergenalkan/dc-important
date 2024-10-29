import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

if (!API_URL) {
  throw new Error("Missing API URL");
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for auth
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data.error);
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data.error);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data.error);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (!error.response) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;