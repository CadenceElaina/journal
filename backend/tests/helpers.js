const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../utils/config");

const testUser = {
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  email: "test@example.com",
  password: "TestPass123!",
  role: "nonProvider",
};

const testProvider = {
  firstName: "Provider",
  lastName: "Smith",
  username: "providersmith",
  email: "provider@example.com",
  password: "ProvPass123!",
  role: "provider",
};

/**
 * Create a user in the database and return the user document + raw password
 */
const createTestUser = async (overrides = {}) => {
  const userData = { ...testUser, ...overrides };
  const saltRounds = 4; // Low rounds for fast test execution
  const passwordHash = await bcrypt.hash(userData.password, saltRounds);

  const user = new User({
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username,
    email: userData.email,
    passwordHash,
    role: userData.role,
    isEmailVerified: true,
  });

  const savedUser = await user.save();
  return { user: savedUser, password: userData.password };
};

/**
 * Generate a valid JWT access token for a user
 */
const generateToken = (user) => {
  const userForToken = {
    username: user.username,
    id: user._id,
  };
  return jwt.sign(userForToken, config.SECRET, { expiresIn: "1h" });
};

/**
 * Generate a valid JWT refresh token for a user and save it to DB
 */
const generateRefreshToken = async (user) => {
  const userForToken = {
    username: user.username,
    id: user._id,
  };
  const refreshToken = jwt.sign(userForToken, config.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  user.refreshToken = refreshToken;
  await user.save();
  return refreshToken;
};

/**
 * Create a user and return auth credentials (token + refreshToken)
 */
const createAuthenticatedUser = async (overrides = {}) => {
  const { user, password } = await createTestUser(overrides);
  const token = generateToken(user);
  const refreshToken = await generateRefreshToken(user);

  return { user, password, token, refreshToken };
};

module.exports = {
  testUser,
  testProvider,
  createTestUser,
  generateToken,
  generateRefreshToken,
  createAuthenticatedUser,
};
