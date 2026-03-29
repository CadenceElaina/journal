import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// Cross-tab token refresh coordination
// Prevents race conditions when multiple tabs detect an expired token simultaneously
// Strategy: Web Locks API > BroadcastChannel > localStorage events (progressive fallback)
let refreshChannel = null;
const HAS_WEB_LOCKS = "locks" in navigator;
const HAS_BROADCAST_CHANNEL = "BroadcastChannel" in window;

if (!HAS_WEB_LOCKS && HAS_BROADCAST_CHANNEL) {
  try {
    refreshChannel = new BroadcastChannel("token-refresh");
  } catch (error) {
    console.warn("BroadcastChannel creation failed:", error);
  }
}

let isRefreshing = false;
let failedQueue = [];

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

// BroadcastChannel listener - receives refresh results from other tabs
if (refreshChannel) {
  refreshChannel.onmessage = (event) => {
    if (event.data.type === "REFRESH_COMPLETE") {
      processQueue(null, event.data.token);
    } else if (event.data.type === "REFRESH_FAILED") {
      processQueue(new Error("Token refresh failed in another tab"), null);
    }
  };
}

// localStorage storage event listener - fallback for older browsers
if (!HAS_WEB_LOCKS && !HAS_BROADCAST_CHANNEL) {
  window.addEventListener("storage", (event) => {
    if (event.key === "accessToken" && event.newValue) {
      processQueue(null, event.newValue);
    }
    if (event.key === "accessToken" && event.newValue === null) {
      window.location.href = "/login";
    }
  });
}

// REQUEST INTERCEPTOR: Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR: Handle 401 errors with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (HAS_WEB_LOCKS) {
      return handleRefreshWithWebLocks(originalRequest);
    } else if (HAS_BROADCAST_CHANNEL && refreshChannel) {
      return handleRefreshWithBroadcastChannel(originalRequest);
    } else {
      return handleRefreshWithLocalStorage(originalRequest);
    }
  },
);

// Strategy 1: Web Locks API (prevents concurrent refresh across tabs via browser-level lock)
async function handleRefreshWithWebLocks(originalRequest) {
  try {
    return await navigator.locks.request(
      "token-refresh",
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          await waitForTokenUpdate();
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem(
            "accessToken",
          )}`;
          return api(originalRequest);
        }
        return await performTokenRefresh(originalRequest);
      },
    );
  } catch (lockError) {
    return Promise.reject(lockError);
  }
}

// Strategy 2: BroadcastChannel (notifies other tabs of refresh result)
async function handleRefreshWithBroadcastChannel(originalRequest) {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  const otherTabRefreshing = localStorage.getItem("token-refreshing");
  if (otherTabRefreshing === "true") {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
      setTimeout(() => reject(new Error("Token refresh timeout")), 5000);
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  isRefreshing = true;
  localStorage.setItem("token-refreshing", "true");

  try {
    const result = await performTokenRefresh(originalRequest);
    refreshChannel.postMessage({
      type: "REFRESH_COMPLETE",
      token: localStorage.getItem("accessToken"),
    });
    return result;
  } catch (refreshError) {
    refreshChannel.postMessage({ type: "REFRESH_FAILED" });
    throw refreshError;
  } finally {
    isRefreshing = false;
    localStorage.removeItem("token-refreshing");
  }
}

// Strategy 3: localStorage + storage events (broadest browser support)
async function handleRefreshWithLocalStorage(originalRequest) {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  const lockAcquired = tryAcquireLock();

  if (!lockAcquired) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
      setTimeout(() => reject(new Error("Token refresh timeout")), 5000);
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  isRefreshing = true;

  try {
    return await performTokenRefresh(originalRequest);
  } finally {
    releaseLock();
    isRefreshing = false;
  }
}

// Shared refresh logic used by all strategies
async function performTokenRefresh(originalRequest) {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    processQueue(new Error("No refresh token"), null);
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post("/api/auth/refresh", { refreshToken });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("tokenRefreshedAt", Date.now().toString());

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    processQueue(null, newAccessToken);

    return api(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    localStorage.clear();
    window.location.href = "/login";
    throw refreshError;
  }
}

// Wait for token update from another tab (used by Web Locks strategy)
function waitForTokenUpdate() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const refreshedAt = localStorage.getItem("tokenRefreshedAt");

      if (refreshedAt && Date.now() - parseInt(refreshedAt) < 2000) {
        clearInterval(checkInterval);
        resolve();
      }

      if (Date.now() - startTime > 5000) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
}

// localStorage-based lock mechanism (fallback for browsers without Web Locks/BroadcastChannel)
function tryAcquireLock() {
  const lockKey = "token-refresh-lock";
  const lockValue = Date.now().toString();
  const existingLock = localStorage.getItem(lockKey);

  if (existingLock && Date.now() - parseInt(existingLock) < 5000) {
    return false;
  }

  localStorage.setItem(lockKey, lockValue);

  return new Promise((resolve) => {
    setTimeout(() => {
      const currentLock = localStorage.getItem(lockKey);
      resolve(currentLock === lockValue);
    }, 50);
  }).then((acquired) => acquired);
}

function releaseLock() {
  localStorage.removeItem("token-refresh-lock");
}

export default api;
