import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});


// Request interceptor to add token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling, logging, etc.
api.interceptors.response.use(
  (response) => {
    // You can add custom logic here (e.g., logging, notifications)
    return response;
  },
  (error) => {
    // Handle 401/403 errors, redirect to login, etc.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Optionally trigger a logout or redirect
      // window.location.href = "/login";
    }
    // Optionally log errors
    // console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default api;
