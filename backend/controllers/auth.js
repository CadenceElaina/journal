const authRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const config = require("../utils/config");

// Refresh access token using refresh token
authRouter.post("/refresh", async (request, response, next) => {
  try {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return response.status(401).json({ error: "refresh token required" });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return response.status(401).json({ error: "invalid refresh token" });
    }

    // Verify the refresh token
    try {
      jwt.verify(refreshToken, config.REFRESH_SECRET);
    } catch (error) {
      // Token invalid or expired - clear it from database
      user.refreshToken = null;
      await user.save();
      return response
        .status(401)
        .json({ error: "refresh token expired or invalid" });
    }

    // Generate new access token
    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const newAccessToken = jwt.sign(userForToken, config.SECRET, {
      expiresIn: 60 * 60, // 1 hour
    });

    response.json({
      accessToken: newAccessToken,
      username: user.username,
    });
  } catch (error) {
    next(error);
  }
});

// Logout - invalidate refresh token
authRouter.post("/logout", async (request, response, next) => {
  try {
    const { refreshToken } = request.body;

    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = authRouter;
