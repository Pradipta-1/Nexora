import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 45000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = 
      error.response?.data?.detail || 
      error.message || 
      'An unexpected error occurred while communicating with Nexora backend.';
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
