import api from "./api";

const completeOnboarding = async (providerData) => {
  const response = await api.patch("/users/profile/provider", providerData);
  return response.data;
};

export default {
  completeOnboarding,
};
