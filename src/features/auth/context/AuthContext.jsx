import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../../../services/auth";

const AuthContext = createContext(null);

const AUTH_STATUS = {
  LOGGED_OUT: "loggedOut",
  LOGGED_IN: "loggedIn",
  DEMO: "demo",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
  });
  const [status, setStatus] = useState(AUTH_STATUS.LOGGED_OUT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedRefreshToken = localStorage.getItem("refreshToken");

    if (savedUser && savedAccessToken && savedRefreshToken) {
      setUser(JSON.parse(savedUser));
      setTokens({
        accessToken: savedAccessToken,
        refreshToken: savedRefreshToken,
      });
      setStatus(AUTH_STATUS.LOGGED_IN);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      // get user data and tokens
      const data = await authService.login(credentials);
      setIsLoading(false);

      const userData = {
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
        isEmailVerified: data.isEmailVerified || false,
      };

      const tokenData = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };

      // set user data and tokens
      setUser(userData);
      setTokens(tokenData);
      setStatus(AUTH_STATUS.LOGGED_IN);

      // Persist to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("accessToken", data.token); // Store directly
      localStorage.setItem("refreshToken", data.refreshToken); // Store directly

      return { success: true, data: userData };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg || "Login failed",
      };
    }
  };

  const loginAsDemo = async () => {
    // Make it async
    try {
      setIsLoading(true);
      const data = await authService.createDemoSession(); // Add await
      setIsLoading(false);

      const demoUserData = {
        username: data.username,
        name: "Demo User",
        isEmailVerified: true, // Demo users are always verified
        isDemo: true,
      };

      const tokenData = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };

      setUser(demoUserData);
      setTokens(tokenData);
      setStatus(AUTH_STATUS.DEMO);

      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      return { success: true, data: demoUserData };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Demo session failed";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg || "Demo session failed",
      };
    }
  };

  const logout = async () => {
    try {
      if (tokens.refreshToken) {
        setIsLoading(true);
        await authService.logout(tokens.refreshToken); // invalidate token in backend
        setIsLoading(false);
      }
    } catch (error) {
      setError(`Logout error: ${error}`);
      console.error("Logout error:", error);
    } finally {
      // Clear state regardless of API success
      setUser(null);
      setTokens({ accessToken: null, refreshToken: null });
      setStatus(AUTH_STATUS.LOGGED_OUT);
      localStorage.removeItem("user");
      localStorage.removeItem("tokens");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const refresh = async () => {
    try {
      if (!tokens.refreshToken) {
        throw new Error("No refresh token available");
      }
      setIsLoading(true);
      const data = await authService.refreshToken(tokens.refreshToken);
      setIsLoading(false);

      const newTokens = {
        accessToken: data.accessToken, // new token
        refreshToken: tokens.refreshToken, // keep same refresh token
      };

      setTokens(newTokens);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Invalid or expired code";
      setError(errorMsg);
      // Refresh failed - log out user
      await logout(); // user = null, tokens = null, status = logged_out, removes user and tokens from local storage
      return {
        success: false,
        error: "Session expired. Please log in again.",
      };
    }
  };

  const updateEmailVerificationStatus = (isVerified) => {
    if (user) {
      const updatedUser = { ...user, isEmailVerified: isVerified };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    status,
    tokens,
    isLoading,
    error,
    setError,
    AUTH_STATUS,
    login,
    loginAsDemo,
    logout,
    refresh,
    updateEmailVerificationStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
