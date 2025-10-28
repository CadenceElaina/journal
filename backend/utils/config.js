require("dotenv").config();

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || "development";
const SECRET = process.env.SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

module.exports = {
  MONGODB_URI,
  PORT,
  NODE_ENV,
  SECRET,
  REFRESH_SECRET,
  EMAIL,
  EMAIL_PASSWORD,
};
