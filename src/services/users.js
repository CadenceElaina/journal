import api from "./api";

const baseUrl = "/users";

const signup = async (user) => {
  try {
    const response = await api.post(baseUrl, user);
    return { success: true, data: response.data };
  } catch (error) {
    const data = error.response?.data;
    const message =
      data?.error ||
      (data?.errors?.length
        ? data.errors.map((e) => e.message).join(", ")
        : "Signup failed");
    return { success: false, error: message };
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
