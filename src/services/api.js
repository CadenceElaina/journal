import axios from "axios";
/*
Resources:
https://axios-http.com/docs/interceptors
https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
https://www.youtube.com/watch?v=16-1mTdGBoM

Notes: 
interceptors are middleware - they run before/after each request/response
Our request interceptor automatically adds tokens to headers
Response interceptro catches 401 errors and refreshes token
Queuing - prevents multiple refresh calls if multiple requests fail at once
*/

const api = axios.create({
  baseURL: "/api",
  timeout: 10000, // 10 second timeout - if server is down or slow it times out after 10 seconds - preventing permanent loading for user
});

/*
Resources: 
https://blog.pixelfreestudio.com/how-to-manage-state-across-multiple-tabs-and-windows/
https://stackoverflow.com/questions/51646853/automating-access-token-refreshing-via-interceptors-in-axios
https://stackoverflow.com/questions/28230845/communication-between-tabs-or-windows
https://dev.to/naismith/cross-tab-communication-with-javascript-1hc9
https://medium.com/@piyalidas.it/angular-cross-tab-sync-with-broadcastchannel-api-web-locks-api-ac31eff0a947
*/

//PROBLEM WITHOUT QUEUE
/*
User has 3 tabs open, all making requests at the same time - token expired 1 minute ago
Tab 1: api.get("/journals")     → 401
Tab 2: api.get("/users/profile") → 401
Tab 3: api.get("/settings")      → 401

WITHOUT QUEUING: 
All 3 tabs will refresh at once - creating 3 refresh tokens for one user and only the last being valid - making two tabs out of sync
POST /api/auth/refresh (from Tab 1)
POST /api/auth/refresh (from Tab 2)
POST /api/auth/refresh (from Tab 3)

CROSS-TAB TOKEN REFRESH STRATEGY:
1. Web Locks API 
2. BroadcastChannel
3. localStorage + storage events 
*/

// Track if we're currently refreshing to prevent multiple refresh calls
// Initialize cross-tab communication
let refreshChannel = null;
const HAS_WEB_LOCKS = "locks" in navigator; // does the browser the client is using have weblocks?
const HAS_BROADCAST_CHANNEL = "BroadcastChannel" in window; // do they have broadcast channel

// Try to create BroadcastChannel for browsers without Web Locks
if (!HAS_WEB_LOCKS && HAS_BROADCAST_CHANNEL) {
  try {
    refreshChannel = new BroadcastChannel("token-refresh");
    console.log("Using BroadcastChannel for cross-tab communication");
  } catch (error) {
    console.warn("BroadcastChannel creation failed: ", error);
  }
}

// Track refresh state
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

// Listen for refresh completion from other tabs - BroadcastChannel
if (refreshChannel) {
  refreshChannel.onmessage = (event) => {
    if (event.data.type === "REFRESH_COMPLETE") {
      console.log("Token refresh completed in another tab");
      processQueue(null, event.data.token);
    } else if (event.data.type === "REFRESH_FAILED") {
      console.log("Token refresh failed in another tab");
      processQueue(new Error("Token refresh failed in another tab"), null);
    }
  };
}

// Listen for localStorage changes - fallback for older browsers
if (!HAS_WEB_LOCKS && !HAS_BROADCAST_CHANNEL) {
  console.log("Using localStorage events for cross-tab communication");
  window.addEventListener("storage", (event) => {
    // Another tba updated the token
    if (event.key === "accessToken" && event.newValue) {
      console.log("Token updated in another tab");
      processQueue(null, event.newValue);
    }
    // Another tab cleared tokens - logout
    if (event.key === "accessToken" && event.newValue === null) {
      console.log("Logged out in another tab");
      window.location.href = "/login";
    }
  });
}

// REQUEST INTERCEPTOR: Add token to every request
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

// RESPONSE INTERCEPTOR: Handle 401 errors with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If not 401 or already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Use Web Locks API if available
    if (HAS_WEB_LOCKS) {
      return handleRefreshWithWebLocks(originalRequest, error);
    }
    // Use BroadcastChannel if available as fallback
    else if (HAS_BROADCAST_CHANNEL && refreshChannel) {
      return handleRefreshWithBroadcastChannel(originalRequest, error);
    }
    // Use localStorage as final fallback
    else {
      return handleRefreshWithLocalStorage(originalRequest, error);
    }
  }
);

// ============================================================================
// STRATEGY 1: Web Locks API (Modern browsers)
// ============================================================================
async function handleRefreshWithWebLocks(originalRequest, error) {
  try {
    // Request lock with ifAvailable option (non-blocking)
    return await navigator.locks.request(
      "token-refresh",
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          // Another tab holds the lock, wait for it to finish
          console.log("Another tab is refreshing token (Web Locks)");
          await waitForTokenUpdate();
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem(
            "accessToken"
          )}`;
          return api(originalRequest);
        }

        // We got the lock this tab will refresh
        console.log("This tab acquired lock and will refresh token");
        return await performTokenRefresh(originalRequest);
      }
    );
  } catch (lockError) {
    console.error("Web Locks error:", lockError);
    return Promise.reject(lockError);
  }
}

// ============================================================================
// STRATEGY 2: BroadcastChannel (Good browser support, Safari 15.4+)
// ============================================================================
async function handleRefreshWithBroadcastChannel(originalRequest, error) {
  // If this tab is already refreshing, queue
  if (isRefreshing) {
    console.log("Already refreshing in this tab, queueing request");
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  // Check if another tab is refreshing
  const otherTabRefreshing = localStorage.getItem("token-refreshing");
  if (otherTabRefreshing === "true") {
    console.log("Another tab is refreshing token (BroadcastChannel)");
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });

      // Safety timeout
      setTimeout(() => {
        reject(new Error("Token refresh timeout"));
      }, 5000);
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  // This tab will refresh
  console.log("This tab will refresh token (BroadcastChannel)");
  isRefreshing = true;
  localStorage.setItem("token-refreshing", "true");

  try {
    const result = await performTokenRefresh(originalRequest);

    // Notify other tabs of success
    refreshChannel.postMessage({
      type: "REFRESH_COMPLETE",
      token: localStorage.getItem("accessToken"),
    });

    return result;
  } catch (refreshError) {
    // Notify other tabs of failure
    refreshChannel.postMessage({
      type: "REFRESH_FAILED",
    });
    throw refreshError;
  } finally {
    isRefreshing = false;
    localStorage.removeItem("token-refreshing");
  }
}

// ============================================================================
// STRATEGY 3: localStorage + storage events (Supports all browsers except IE11 and older)
// ============================================================================
async function handleRefreshWithLocalStorage(originalRequest, error) {
  // If this tab is refreshing, queue
  if (isRefreshing) {
    console.log("Already refreshing in this tab, queuing request");
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  // Try to aquire lock using localStorage
  const lockAcquired = tryAcquireLock();

  if (!lockAcquired) {
    console.log("Another tab is refreshing token (localStorage)");
    // Another tab is refreshing, wait for storage event
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });

      // Safety timeout
      setTimeout(() => {
        reject(new Error("Token refresh timeout"));
      }, 5000);
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    });
  }

  // We have the lock this tab will refresh
  console.log("This tab acquired lock and will refresh token (localStorage)");
  isRefreshing = true;

  try {
    return await performTokenRefresh(originalRequest);
  } finally {
    releaseLock();
    isRefreshing = false;
  }
}

// ============================================================================
// SHARED: Token refresh logic (used by all strategies)
// ============================================================================

async function performTokenRefresh(originalRequest) {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    processQueue(new Error("No refresh token"), null);
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("No refresh token available");
  }

  try {
    console.log("Calling refresh endpoint...");
    const response = await axios.post("/api/auth/refresh", { refreshToken });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    // Save new tokens
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("tokenRefreshedAt", Date.now().toString());

    console.log("Token refresh successful");

    // Update original request
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    // Process queued requests in this tab
    processQueue(null, newAccessToken);

    // Retry original requset
    return api(originalReqeust);
  } catch (refreshError) {
    console.error("Token refresh failed", refreshError);
    processQueue(refreshError, null);
    localStorage.clear();
    window.location.href = "/login";
    throw refreshError;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

// Wait for token to be updated by another tab (Web Locks)
function waitForTokenUpdate() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const refreshedAt = localStorage.getItem("tokenRefreshedAt");

      // Check if token was recently updated
      if (refreshedAt && Date.now() - parseInt(refreshedAt) < 2000) {
        clearInterval(checkInterval);
        console.log("Token updated by another tab");
        resolve();
      }

      // Timeout after 5 seconds
      if (Date.now() - startTime > 5000) {
        clearInterval(checkInterval);
        console.warn("Token update wait timeout");
        resolve();
      }
    }, 100);
  });
}

// Lock mechanism using localStorage (fallback for old browsers)
function tryAcquireLock() {
  const lockKey = "token-refresh-lock";
  const lockValue = Date.now().toString();
  const existingLock = localStorage.getItem(lockKey);

  // Check if existing lock is stale (older than 5 seconds)
  if (existingLock && Date.now() - parseInt(existingLock) < 5000) {
    return false; // Lock is held by another tab
  }

  // Acquire lock
  localStorage.setItem(lockKey, lockValue);

  // Double-check we got the lock (race condition mitigation)
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
