import axios from "axios";
import settings from "../config/settings"

// Create an Axios instance
const api = axios.create({
  baseURL: settings.apiBaseUrl,
})

// Request interceptor to add token from localStorage
api.interceptors.request.use(
  (config) => {
        // You can add custom logic here (e.g., logging, notifications)
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    else{
      console.log("No auth token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling, logging, etc.
api.interceptors.response.use(
  (response) => {

    return response
  },
    (error) => {
      // Handle 401/403 errors, redirect to logout page
      if (error.response){
        console.log("Error", error);
        console.log("Error Response:", error.response);
        if (error.response.data)
        {
          console.log("Error Response Data:", error.response.data);
          if (error.response.data.detail)
            console.log("Error Response Data Detail:", error.response.data.detail);
        }
      }
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        localStorage.removeItem("auth_token")
        console.log("Auth0 token removed from localStorage")
        setTimeout(() => {
          window.location.href = "/logout"
        }, 100)
      }
      // Optionally log errors
      // console.error("API error:", error);
      return Promise.reject(error)
    }
);

export default api;
