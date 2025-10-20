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

const refreshToken = async (refreshToken) => {
  const response = await axios.post(`${baseUrl}/refresh`, { refreshToken });
  return response.data;
};

const requestPasswordReset = async (email) => {
  const response = await axios.post(`${baseUrl}/forgot-password/request`, { email });
  return response.data;
};

const verifyResetCode = async (email, resetCode) => {
  const response = await axios.post(`${baseUrl}/password-reset/verify`, { email, resetCode });
  return response.data;
};

const resetPassword = async (email, resetCode, newPassword) => {
  const response = await axios.post(`${baseUrl}/password-reset/reset`, { email, resetCode, newPassword });
  return response.data;
};

export default {
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};
