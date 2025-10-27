import axios from "axios";
//https://axios-http.com/docs/interceptors
//interceptors are middleware - they run before/after each request/response
//Our request interceptor automatically adds tokens to headers
//Response interceptro catches 401 errors and refreshes token
//Queuing - prevents multiple refresh calls if multiple requests fail at once

const api = axios.create({
  baseURL: "/api",
  timeout: 10000, // 10 second timeout - if server is down or slow it times out after 10 seconds - preventing permanent loading for user
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after refresh completes
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

// REQUEST INTERCEPTOR: Runs before every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR:
// Catch 401 errors and refresh automatically
api.interceptors.response.use(
  // If response is successful (200-299) return it
  (response) => response,

  // Handle error
  async (error) => {
    const originalRequest = error.config;
    // Underscore is a JavaScript convention that says: "This is a custom property I'm adding to this object"
    //https://www.delftstack.com/howto/javascript/javascript-underscore/
    //https://medium.com/@nazarianarkadi/understanding-the-underscore-variable-convention-347cab9ea5f5
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // error is not 401 or request already retried, reject immediately
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(new Error("No refresh token available"));
      }

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token then user needs to login again
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        // Save new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        //Update authorization header - failed request with new token
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear storage, processQueue - no longer refreshing - and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // If its not a 401 or refresh already failed reject the error
    return Promise.reject(error);
  }
);

export default api;
