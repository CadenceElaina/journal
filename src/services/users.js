import api from "./api";

const baseUrl = "/users";

const signup = async (user) => {
  try {
    const response = await api.post(baseUrl, user);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Signup failed",
    };
  }
};

const deleteAccount = async (password) => {
  const response = await api.delete(`${baseUrl}/account`, {
    data: { password, confirmDelete: true },
  });
  return response.data;
};

export default {
  signup,
  deleteAccount,
};
