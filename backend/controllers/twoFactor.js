const twoFactorRouter = require("express").Router();
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const config = require("../utils/config");
const middleware = require("../utils/middleware");
const { twoFactorLimiter } = require("../utils/rateLimiters");

twoFactorRouter.post(
  "/setup",
  twoFactorLimiter,
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      if (user.twoFactorEnabled) {
        return response.status(400).json({ error: "2FA is already enabled" });
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `JournalApp (${user.email})`,
        issuer: "JournalApp",
      });

      // Store secret (not enabled yet - user must verify first)
      user.twoFactorSecret = secret.base32;
      await user.save();

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // secret is shared via QR code
      response.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: "Scan this QR code with your authenticator app",
      });
    } catch (error) {
      next(error);
    }
  }
);

twoFactorRouter.post(
  "/verify-setup",
  twoFactorLimiter,
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const { token } = request.body;
      const user = request.user;

      if (!user || !user.twoFactorSecret) {
        return response
          .status(400)
          .json({ error: "No 2FA setup found. Please start setup first." });
      }

      if (user.twoFactorEnabled) {
        return response.status(400).json({ error: "2FA is already enabled" });
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token,
        window: 2, // Allow 2 time steps tolerance - what if User's phone clock is off 30 seconds?, User types slowly and code expires mid-entry?, Network delay between client and server? - window: 2 means accept codes from 2 time steps before and after
      });

      if (!verified) {
        return response
          .status(400)
          .json({ error: "Invalid token. Please try again." });
      }

      // Generate backup codes (10 codes)
      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // Hash backup codes before storing
      const hashedBackupCodes = await Promise.all(
        backupCodes.map((code) => bcrypt.hash(code, 10))
      );

      user.twoFactorEnabled = true;
      user.backupCodes = hashedBackupCodes;
      await user.save();

      response.json({
        message:
          "2FA enabled successfully. Save these backup codes in a safe place!",
        backupCodes: backupCodes, // Send plain codes to user once
      });
    } catch (error) {
      next(error);
    }
  }
);

twoFactorRouter.post(
  "/verify-login",
  twoFactorLimiter,
  async (request, response, next) => {
    try {
      const { tempToken, twoFactorToken, backupCode } = request.body;

      if (!tempToken) {
        return response.status(400).json({ error: "Temporary token required" });
      }

      // Verify temporary token to get user ID
      let decoded;
      try {
        decoded = jwt.verify(tempToken, config.SECRET);
      } catch (error) {
        return response
          .status(401)
          .json({ error: "Invalide or expired temporary token" });
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return response.status(401).json({ error: "User not found" });
      }

      if (!user.twoFactorEnabled) {
        return response
          .status(400)
          .json({ error: "2FA is not enabled for this account" });
      }

      // If 2FA is enabled but no token provided, request it
      if (!twoFactorToken && !backupCode) {
        return response.status(200).json({
          requires2FA: true,
          message: "Please provide 2FA token",
        });
      }

      let verified = false;

      // Verify 2FA token
      if (twoFactorToken) {
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: twoFactorToken,
          window: 2,
        });
      }

      // Verify backup code if provided
      if (!verified && backupCode && user.backupCodes.length > 0) {
        for (let i = 0; i < user.backupCodes.length; i++) {
          const isValid = await bcrypt.compare(backupCode, user.backupCodes[i]);
          if (isValid) {
            verified = true;
            // Remove used backup code
            user.backupCodes.splice(i, 1);
            await user.save();

            // Warn if running low on backup codes
            if (user.backupCodes.length <= 2) {
              response.locals.warning = `Warning: Only ${user.backupCodes.length} backup codes remaining`;
            }
            break;
          }
        }
      }

      if (!verified) {
        return response
          .status(401)
          .json({ error: "Invalid 2FA token or backup code" });
      }

      // Generate full access tokens
      const userForToken = {
        username: user.username,
        id: user._id,
      };

      const token = jwt.sign(userForToken, config.SECRET, {
        expiresIn: 60 * 60,
      });

      const refreshToken = jwt.sign(userForToken, config.REFRESH_SECRET, {
        expiresIn: 60 * 60 * 24 * 7, //7 days
      });

      user.refreshToken = refreshToken;
      await user.save();

      response.json({
        token,
        refreshToken,
        prefix: user.prefix,
        firstName: user.firstName,
        lastName: user.lastName,
        suffix: user.suffix,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        warning: response.locals.warning,
      });
    } catch (error) {
      next(error);
    }
  }
);

twoFactorRouter.post(
  "/disable",
  twoFactorLimiter,
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const { password, twoFactorToken } = request.body;
      const user = request.user;

      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      if (!user.twoFactorEnabled) {
        return response.status(400).json({ error: "2FA is not enabled" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return response.status(401).json({ message: "Invalid password" });
      }

      // Verify 2FA token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorToken,
        window: 2,
      });

      if (!verified) {
        return response.status(400).json({ message: "Invalid 2FA token" });
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.backupCodes = [];
      await user.save();

      response.json({ message: "2FA disabled successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = twoFactorRouter;
