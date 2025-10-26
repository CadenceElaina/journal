import axios from "axios";
const baseUrl = "/api/users/profile/provider";

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const completeOnboarding = async (providerData) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.patch(baseUrl, providerData, config);
  return response.data;
};

export default {
  setToken,
  completeOnboarding,
};
