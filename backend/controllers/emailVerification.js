const emailVerificationRouter = require("express").Router();
const crypto = require("crypto");
const { generateRandomAlphaNumericString } = require("../utils/middleware");
const User = require("../models/user");
const EmailVerification = require("../models/emailVerification");
const { sendEmail } = require("../utils/mailer");
const { emailVerificationLimiter } = require("../utils/rateLimiters");

// Send verification code
emailVerificationRouter.post(
  "/send",
  emailVerificationLimiter,
  async (request, response, next) => {
    const { email } = request.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return response.status(404).json({
          error: "user not found",
        });
      }

      if (user.isEmailVerified) {
        return response.status(400).json({
          error: "email already verified",
        });
      }

      // Rate limiting: max 3 verification emails per day
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      const verificationCount = await EmailVerification.countDocuments({
        email: email,
        createdAt: { $gte: todayStart },
      });

      if (verificationCount >= 3) {
        return response.status(429).json({
          error: "Too many verification requests. Try again tomorrow.",
        });
      }

      // Generate verification code (expires in 15 minutes)
      const verificationCode = generateRandomAlphaNumericString(6);

      // Save verification code to database first
      const newVerification = new EmailVerification({
        verificationCode: verificationCode,
        expiresAt: Date.now() + 60 * 15 * 1000, // 15 minutes
        attempts: 0,
        email: email,
      });

      await newVerification.save();

      // Send email with verification code
      try {
        await sendEmail(
          email,
          "Email Verification Code",
          `Your email verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.`
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Email failed but code is saved - user can still request resend
      }

      response.status(200).send("Verification email sent");
    } catch (error) {
      next(error);
    }
  }
);

// Verify code
emailVerificationRouter.post(
  "/verify",
  emailVerificationLimiter,
  async (request, response, next) => {
    try {
      const { verificationCode, email } = request.body;

      const verificationDocument = await EmailVerification.findOne({
        email: email,
      });

      if (!verificationDocument) {
        return response
          .status(401)
          .json({ error: "no verification code found" });
      }

      if (verificationDocument.expiresAt < Date.now()) {
        return response
          .status(401)
          .json({ error: "verification code expired" });
      }

      if (verificationDocument.attempts >= 3) {
        return response.status(401).json({ error: "too many attempts" });
      }

      if (verificationCode !== verificationDocument.verificationCode) {
        verificationDocument.attempts++;
        await verificationDocument.save();
        return response.status(401).json({ error: "incorrect code" });
      }

      // Check if this is for an email change (user has pendingEmail matching this email)
      const userWithPendingEmail = await User.findOne({ pendingEmail: email });

      if (userWithPendingEmail) {
        // Email change verification
        userWithPendingEmail.email = userWithPendingEmail.pendingEmail;
        userWithPendingEmail.pendingEmail = undefined;
        userWithPendingEmail.isEmailVerified = true;
        await userWithPendingEmail.save();

        // Delete verification document
        await EmailVerification.deleteOne({ _id: verificationDocument._id });

        return response.status(200).json({
          message:
            "Email changed succesfully! Please log in with your new email",
          isEmailVerified: true,
        });
      }

      // Mark user as verified
      const user = await User.findOne({ email: email });
      if (!user) {
        return response.status(404).json({ error: "user not found" });
      }

      user.isEmailVerified = true;
      await user.save();

      // Delete verification document
      await EmailVerification.deleteOne({ _id: verificationDocument._id });

      response.status(200).json({
        message: "Email verified successfully",
        isEmailVerified: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = emailVerificationRouter;
