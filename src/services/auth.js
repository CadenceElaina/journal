import axios from "axios";

const baseUrl = "/api/auth";

const login = async (credentials) => {
  const response = await axios.post(`${baseUrl}/login`, credentials);
  return response.data;
};

const logout = async (refreshToken) => {
  const response = await axios.post(`${baseUrl}/logout`, { refreshToken });
  return response.data;
};

const refresh = async (refreshToken) => {
  const response = await axios.post(`${baseUrl}/refresh`, { refreshToken });
  return response.data;
};

const requestPasswordReset = async (email) => {
  const response = await axios.post(`${baseUrl}/forgot-password/request`, {
    email,
  });
  return response.data;
};

const verifyResetCode = async (email, resetCode) => {
  const response = await axios.post(`${baseUrl}/password-reset/verify`, {
    email,
    resetCode,
  });
  return response.data;
};

const resetPassword = async (email, resetCode, newPassword) => {
  const response = await axios.post(`${baseUrl}/password-reset/reset`, {
    email,
    resetCode,
    newPassword,
  });
  return response.data;
};

const createDemoSession = async () => {
  const response = await axios.post("/api/demo");
  return response.data;
};

export default {
  login,
  logout,
  refresh,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  createDemoSession,
};
