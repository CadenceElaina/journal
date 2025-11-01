const bcrypt = require("bcrypt");
const crypto = require("crypto");
const usersRouter = require("express").Router();
const User = require("../models/user");
const EmailVerification = require("../models/emailVerification");
const { sendEmail } = require("../utils/mailer");
const middleware = require("../utils/middleware");
const { registrationLimiter } = require("../utils/rateLimiters");
const {
  passwordValidationRules,
  validate: validatePassword,
} = require("../utils/passwordValidator");
const {
  registrationValidationRules,
  usernameValidation,
  emailValidation,
  nameValidation,
  validate,
} = require("../utils/inputValidator");

// Get all users - ADMIN ONLY or REMOVED
// TODO: Decide if this endpoint is needed. If yes, add admin authentication.
// For now, requiring authentication and hiding sensitive data
usersRouter.get(
  "/",
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      if (!request.user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      // Only return non-sensitive user info
      const users = await User.find({})
        .select(
          "firstName lastName username role prefix suffix providerProfile.specialty -_id"
        )
        .lean();

      response.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// Register new user
usersRouter.post(
  "/",
  registrationLimiter,
  registrationValidationRules(),
  validate,
  passwordValidationRules(),
  validatePassword,
  async (request, response, next) => {
    try {
      const { firstName, lastName, username, email, password, role } =
        request.body;

      // Check for existing email
      const existingUserEmail = await User.findOne({
        email: email.toLowerCase(),
      });
      if (existingUserEmail) {
        return response.status(400).json({
          error: "Email is already registered",
        });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response.status(400).json({
          error: "User name is already taken",
        });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({
        firstName,
        lastName,
        username,
        email: email.toLowerCase(),
        passwordHash,
        role,
        onboardingCompleted: role === "nonProvider", // nonProviders don't need onboarding
      });

      const savedUser = await user.save();

      const verificationCode = middleware.generateRandomAlphaNumericString(6);

      const newVerification = new EmailVerification({
        verificationCode: verificationCode,
        expiresAt: Date.now() + 60 * 15 * 1000, // 15 minutes
        attempts: 0,
        email: email.toLowerCase(),
      });

      await newVerification.save();

      // Send email after saving to database
      try {
        await sendEmail(
          email,
          "Email Verification Code",
          `Welcome! Your email verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.`
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue - user can request resend
      }

      response.status(201).json(savedUser);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/profile - Get current user profile
usersRouter.get(
  "/profile",
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const user = request.user;

      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      response.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/users/profile - Update user profile (name, username)
usersRouter.patch(
  "/profile",
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const user = request.user;
      const { firstName, lastName, username, password } = request.body;

      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      // Require password for any profile changes
      if (!password) {
        return response
          .status(400)
          .json({ error: "Password is required to update profile" });
      }

      const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
      if (!passwordCorrect) {
        return response.status(401).json({ error: "Invalid password" });
      }

      // Update fields if provided
      if (firstName !== undefined) {
        // Validate firstName
        if (!/^[\p{L}\s'-]+$/u.test(firstName) || firstName.length > 50) {
          return response.status(400).json({
            error:
              "First name can only contain letters, spaces, hyphens, and apostrophes (max 50 characters)",
          });
        }
        user.firstName = firstName.trim();
      }

      if (lastName !== undefined) {
        //Validate lastName
        if (!/^[\p{L}\s'-]+$/u.test(lastName) || lastName.length > 50) {
          return response.status(400).json({
            error:
              "Last name can only contain letters, spaces, hyphens, and apostrophes (max 50 characters)",
          });
        }
        user.lastName = lastName.trim();
      }

      if (username !== undefined) {
        // Validate username
        if (
          !/^[a-zA-Z0-9_-]+$/.test(username) ||
          username.length < 3 ||
          username.length > 20
        ) {
          return response.status(400).json({
            error:
              "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens",
          });
        }

        // Check if username is already taken
        const existingUser = await User.findOne({
          username,
          _id: { $ne: user._id }, // find a user with this username who's _id does not match - meaning the username is taken
        });
        if (existingUser) {
          return response
            .status(400)
            .json({ error: "Username is already taken" });
        }

        user.username = username.trim();
      }

      const updatedUser = await user.save();
      response.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/users/profile/password - Change password
usersRouter.patch(
  "/profile/password",
  middleware.userExtractor,
  passwordValidationRules(),
  validatePassword,
  async (request, response, next) => {
    try {
      const user = request.user;
      const { currentPassword, password } = request.body;

      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      if (!currentPassword) {
        return response
          .status(400)
          .json({ error: "Current password is required" });
      }

      // Verify current password
      const passwordCorrect = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!passwordCorrect) {
        return response
          .status(401)
          .json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Update password and invalidate all refresh tokens
      user.passwordHash = passwordHash;
      user.refreshToken = null; // Foreces re-login on all devices

      await user.save();

      response.json({
        message: "Password changed successfully. Please log in again.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/users/profile/email - Change email
usersRouter.patch(
  "/profile/email",
  middleware.userExtractor,
  emailValidation(),
  validate,
  async (request, response, next) => {
    try {
      const user = request.user;
      const { email, password } = request.body;

      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      if (!password) {
        return response
          .status(400)
          .json({ error: "Password is required to change email" });
      }

      // Verify password
      const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
      if (!passwordCorrect) {
        return response.status(401).json({ error: "Invalid password" });
      }

      // Check if email is already in use
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return response
          .status(400)
          .json({ error: "Email is already registered" });
      }

      // Generate verification code for new email
      const verificationCode = middleware.generateRandomAlphaNumericString(6);

      const newVerification = new EmailVerification({
        verificationCode: verificationCode,
        expiresAt: Date.now() + 60 * 15 * 1000, // 15 minutes
        attempts: 0,
        email: email.toLowerCase(),
      });

      await newVerification.save();

      // Send verification email to NEW email address
      try {
        await sendEmail(
          email,
          "Verify Your New Email Address",
          `You requested to change your email address. Your verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this change, please ignore this email.`
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return response
          .status(500)
          .json({ error: "Failed to send verification email" });
      }

      // Store new email temporarily (will be updated after verification)
      user.pendingEmail = email.toLowerCase();
      user.isEmailVerified = false;

      await user.save();

      response.json({
        message:
          "Verification code sent to new email address. Please verify to complete email change.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/users/account - Delete account
usersRouter.delete(
  "/account",
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const user = request.user;
      const { password, confirmDelete } = request.body;

      if (!user) {
        return response.status(401).json({ error: "Authentication required" });
      }

      if (!password) {
        return response
          .status(400)
          .json({ error: "Password is required to delete account" });
      }

      if (confirmDelete !== true) {
        return response
          .status(400)
          .json({ error: "Please confirm account deletion" });
      }

      // Verify password
      const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
      if (!passwordCorrect) {
        return response.status(401).json({ error: "Invalid password" });
      }

      // Delete all user's journals
      const Journal = require("../models/journal"); // Calling require inside the router prevents circular dependency issues
      await Journal.deleteMany({ user: user._id });

      // Delete the user
      await User.findByIdAndDelete(user._id);

      response.json({ message: "Account deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/users/profile/provider - Complete provider onboarding
usersRouter.patch(
  "/profile/provider",
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      const { prefix, suffix, providerProfile } = request.body;
      const user = request.user; // Set by userExtractor middleware

      if (!user) {
        return response.status(401).json({
          error: "Authentication required",
        });
      }

      if (user.role !== "provider") {
        return response.status(403).json({
          error: "Only providers can complete onboarding",
        });
      }

      // Update user fields
      if (prefix !== undefined) user.prefix = prefix;
      if (suffix !== undefined) user.suffix = suffix;

      if (providerProfile) {
        if (providerProfile.specialty !== undefined) {
          user.providerProfile.specialty = providerProfile.specialty;
        }
        if (providerProfile.license !== undefined) {
          user.providerProfile.license = providerProfile.license;
        }
        if (providerProfile.bio !== undefined) {
          user.providerProfile.bio = providerProfile.bio;
        }
      }

      // Mark onboarding as completed
      user.onboardingCompleted = true;

      const updatedUser = await user.save();

      response.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = usersRouter;
