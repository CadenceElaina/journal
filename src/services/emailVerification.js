import axios from "axios";
const baseUrl = "/api/email-verification";

const sendVerificationCode = async (email) => {
  const response = await axios.post(`${baseUrl}/send`, { email });
  return response.data;
};

const verifyCode = async (email, verificationCode) => {
  const response = await axios.post(`${baseUrl}/verify`, {
    email,
    verificationCode,
  });
  return response.data;
};

export default {
  sendVerificationCode,
  verifyCode,
};
