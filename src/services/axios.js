import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(
        `[Axios] ✓ Request to ${config.method?.toUpperCase()} ${config.url} with auth token`,
      )
    } else {
      console.log(
        `[Axios] ⚠️ Request to ${config.method?.toUpperCase()} ${config.url} WITHOUT auth token`,
      )
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for global error handling, logging, etc.
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401/403 errors, redirect to logout page
    if (error.response) {
      console.error(
        `[Axios] Error ${error.response.status} on ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      )
      if (error.response.data) {
        console.error("[Axios] Error Response Data:", error.response.data)
        if (error.response.data.detail)
          console.error("[Axios] Error Detail:", error.response.data.detail)
      }
    }
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error(
        "[Axios] 401/403 detected - Clearing token and redirecting to logout",
      )
      localStorage.removeItem("auth_token")
      setTimeout(() => {
        window.location.href = "/logout"
      }, 100)
    }
    return Promise.reject(error)
  },
)

export default api;
