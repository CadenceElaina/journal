import axios from "axios";
const baseUrl = "/api/users";

const signup = async (user) => {
  try {
    const response = await axios.post(baseUrl, user);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Signup failed",
    };
  }
};

export default {
  signup,
};
