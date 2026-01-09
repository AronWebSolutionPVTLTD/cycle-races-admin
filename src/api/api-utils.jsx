import axios from 'axios';
import { getToken, removeToken } from './auth-utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor to add auth token and content type
api.interceptors.request.use((config) => {
  const { token } = getToken();
  config.headers.Authorization = `Bearer ${token}`;

  // Handle FormData content type appropriately
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Response interceptor to handle auth errors
let isRefreshing = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      headers: error.config?.headers
    });

    if (error.response?.status === 401 && !isRefreshing && !error.config.url.includes('/riders')) {
      isRefreshing = true;
      console.log('Session expired. Please log in again.');
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Unified API request function
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc)
 * @param {string} url - API endpoint
 * @param {object} data - Request body data
 * @param {object} params - URL parameters
 * @returns {Promise} - Response data or formatted error
 */
const apiRequest = async (method, url, data = {}, params = {}) => {
  try {
    const response = await api({ method, url, data, params });
    return response.data;
  } catch (error) {
    if ((error.response?.status === 401 || error.response?.status === 400) && url.includes('/login')) {
      throw {
        message: error.response?.data?.message || 'Invalid email or password',
        status: error.response?.status
      };
    }
    const errorData = error.message || { message: 'Something went wrong' };
    console.error(`API Error (${url}):`, errorData);
    throw errorData;
  }
};

export default apiRequest;
