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

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedTokens = localStorage.getItem("tokens");

    if (savedUser && savedTokens) {
      setUser(JSON.parse(savedUser));
      setTokens(JSON.parse(savedTokens));
      setStatus(AUTH_STATUS.LOGGED_IN);
    }
  }, []);

  const login = async (credentials) => {
    try {
      // get user data and tokens
      const data = await authService.login(credentials);

      const userData = {
        name: data.name,
        username: data.username,
      };

      const tokenData = {
        token: data.token,
        refreshToken: data.refreshToken,
      };

      // set user data and tokens
      setUser(userData);
      setTokens(tokenData);
      setStatus(AUTH_STATUS.LOGGED_IN);

      // Persist to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("tokens", JSON.stringify(tokenData));

      return { success: true, data: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const loginAsDemo = async () => {
    // Make it async
    try {
      const data = await authService.createDemoSession(); // Add await

      const demoUserData = {
        username: data.username,
        name: "Demo User",
      };

      const tokenData = {
        accessToken: data.token,
        refreshToken: data.refreshToken,
      };

      setUser(demoUserData);
      setTokens(tokenData);
      setStatus(AUTH_STATUS.DEMO);

      return { success: true, data: demoUserData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Demo session failed",
      };
    }
  };

  const logout = async () => {
    try {
      if (tokens.refreshToken) {
        await authService.logout(tokens.refreshToken); // invalidate token in backend
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state regardless of API success
      setUser(null);
      setTokens({ accessToken: null, refreshToken: null });
      setStatus(AUTH_STATUS.LOGGED_OUT);
      localStorage.removeItem("user");
      localStorage.removeItem("tokens");
    }
  };

  const refresh = async () => {
    try {
      if (!tokens.refreshToken) {
        throw new Error("No refresh token available");
      }

      const data = await authService.refreshToken(tokens.refreshToken);

      const newTokens = {
        accessToken: data.accessToken, // new token
        refreshToken: tokens.refreshToken, // keep same refresh token
      };

      setTokens(newTokens);
      localStorage.setItem("tokens", JSON.stringify(newTokens));

      return { success: true };
    } catch (error) {
      // Refresh failed - log out user
      await logout(); // user = null, tokens = null, status = logged_out, removes user and tokens from local storage
      return {
        success: false,
        error: "Session expired. Please log in again.",
      };
    }
  };

  const value = {
    user,
    status,
    tokens,
    AUTH_STATUS,
    login,
    loginAsDemo,
    logout,
    refresh,
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
