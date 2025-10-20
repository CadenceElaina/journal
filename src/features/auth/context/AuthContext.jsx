import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const AUTH_STATUS = {
  LOGGED_OUT: "loggedOut",
  LOGGED_IN: "loggedIn",
  DEMO: "demo",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.LOGGED_OUT);

  const login = async (credentials) => {
    const userData = await 
    setUser(userData);
    setStatus(AUTH_STATUS.LOGGED_IN);
  };

  const loginAsDemo = (userData) => {
    setUser(userData);
    setStatus(AUTH_STATUS.DEMO);
  };

  const logout = () => {
    setUser(null);
    setStatus(AUTH_STATUS.LOGGED_OUT);
  };

  const 

  const value = { user, status, AUTH_STATUS, login, loginAsDemo, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
