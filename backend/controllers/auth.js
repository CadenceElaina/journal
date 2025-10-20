const authRouter = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const config = require("../utils/config");
const sendEmail = require("../utils/mailer");
const PasswordReset = require("../models/passwordReset");

// Login - authenticate user and return tokens
authRouter.post("/login", async (request, response, next) => {
  try {
    const { username, password } = request.body;

    const user = await User.findOne({ username });

    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: "invalid username or password",
      });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, config.SECRET, {
      expiresIn: 60 * 60,
    });

    const refreshToken = jwt.sign(userForToken, config.REFRESH_SECRET, {
      expiresIn: 60 * 60 * 24 * 7,
    });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    response
      .status(200)
      .send({ token, refreshToken, name: user.name, username: user.username });
  } catch (error) {
    next(error);
  }
});

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

authRouter.post("/forgot-password/request", async (request, response, next) => {
  const { email } = request.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(401).json({
        error: "invalid email",
      });
    }

    // Count how many PasswordReset documents exist for this email TODAY
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0); // Midnight UTC

    const resetCount = await PasswordReset.countDocuments({
      email: email,
      createdAt: { $gte: todayStart },
    });

    if (resetCount >= 3) {
      return response.status(429).json({
        error: "Too many reset requests. Try again tomorrow.",
      });
    }

    // code expires after 15 minutes
    // could abstract generate code - length + chars set in utils
    function generateCode(length) {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      let result = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        result += chars[randomIndex];
      }
      return result;
    }

    const resetCode = generateCode(6);
    sendEmail(
      email,
      "Journal Password Reset Code",
      `Your password reset code is: ${resetCode}`
    );
    const newReset = {
      resetCode: resetCode,
      expiresAt: Date.now() + 60 * 15 * 1000, // code lasts 15 minutes
      attempts: 0,
      email: email,
    };
    const resetDoc = new PasswordReset(newReset);
    const savedResetCode = await resetDoc.save();

    response.status(200).send("Password reset email sent");
  } catch (error) {
    next(error);
  }
});

authRouter.post(
  "/password-reset/verify",
  async (request, response, next) => {
    // token
    try {
      // if token matches token then send back confirmation
      const { resetCode, email } = request.body;
      const resetDocument = await PasswordReset.findOne({ email: email });
      if (!resetDocument) {
        return response.status(401).json({ error: "invalid email" });
      }

      if (resetDocument.expiresAt < Date.now()) {
        return response.status(401).json({ error: "reset code expired" });
      }

      if (resetDocument.attempts > 3) {
        return response.status(401).json({ error: "too many attempts" });
      }

      if (resetCode !== resetDocument.resetCode) {
        resetDocument.attempts++;
        resetDocument.save();
        return response.status(401).json({ error: "incorrect code" });
      }

      response.status(200).send("Code validated");
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/password-reset/reset",
  async (request, response, next) => {
    // token
    try {
      const { email, resetCode, newPassword } = request.body;
      const resetDocument = await PasswordReset.findOne({ email: email });
      if (!(newPassword && email)) {
        return response.status(400).json({
          error: "email, and password must be given",
        });
      }
      if (resetCode !== resetDocument.resetCode) {
        resetDocument.attempts++;
        resetDocument.save();
        return response.status(401).json({ error: "incorrect code" });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      const user = await User.findOne({ email: email });
      user.passwordHash = passwordHash;
      await user.save();
      await PasswordReset.deleteOne({ _id: resetDocument._id });
      response.status(200).send("User's password updated");
    } catch (error) {
      next(error);
    }
  }
);

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
