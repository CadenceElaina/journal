const bcrypt = require("bcrypt");
const crypto = require("crypto");
const usersRouter = require("express").Router();
const User = require("../models/user");
const EmailVerification = require("../models/emailVerification");
const { sendEmail } = require("../utils/mailer");
const middleware = require("../utils/middleware");
const {
  passwordValidationRules,
  validate,
} = require("../utils/passwordValidator");

usersRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({});
    response.json(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/",
  passwordValidationRules(),
  validate,
  async (request, response, next) => {
    try {
      const { firstName, lastName, username, email, password, role } =
        request.body;

      if (!(firstName && lastName && username && password && email && role)) {
        return response.status(400).json({
          error:
            "firstName, lastName, username, email, password, and role must be given",
        });
      }

      if (!["provider", "nonProvider"].includes(role)) {
        return response.status(400).json({
          error: "role must be either 'provider' or 'nonProvider'",
        });
      }

      const existingUserEmail = await User.findOne({ email });
      if (existingUserEmail) {
        return response.status(400).json({
          error: "email must be unique",
        });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response.status(400).json({
          error: "username must be unique",
        });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = new User({
        firstName,
        lastName,
        username,
        email,
        passwordHash,
        role,
        onboardingCompleted: role === "nonProvider", // nonProviders don't need onboarding
      });

      const savedUser = await user.save();

      // Generate and send verification code
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

      const verificationCode = generateCode(6);

      const newVerification = new EmailVerification({
        verificationCode: verificationCode,
        expiresAt: Date.now() + 60 * 15 * 1000, // 15 minutes
        attempts: 0,
        email: email,
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
