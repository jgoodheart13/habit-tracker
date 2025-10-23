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
    const token = localStorage.getItem("auth_token")
    let decoded = null
    if (token) {
      // JWT format: header.payload.signature
      const payload = token.split(".")[1]
      if (payload) {
        try {
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
          decoded = JSON.parse(jsonPayload)
          console.log("Decoded token payload:", decoded)
          if (decoded && decoded.exp) {
            const expiryDate = new Date(decoded.exp * 1000)
            console.log("Token expiration date:", expiryDate)
          }
        } catch (e) {
          console.log("Failed to decode token:", e)
        }
      }
    }
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
        // Log out the token and its expiration date (decoded from Auth0 JWT)
        const token = localStorage.getItem("auth_token")
        let decoded = null
        if (token) {
          // JWT format: header.payload.signature
          const payload = token.split(".")[1]
          if (payload) {
            try {
              const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                  )
                  .join("")
              )
              decoded = JSON.parse(jsonPayload)
              console.log("Decoded token payload:", decoded)
              if (decoded && decoded.exp) {
                const expiryDate = new Date(decoded.exp * 1000)
                console.log("Token expiration date:", expiryDate)
              }
            } catch (e) {
              console.log("Failed to decode token:", e)
            }
          }
        }

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
