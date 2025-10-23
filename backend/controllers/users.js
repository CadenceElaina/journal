const bcrypt = require("bcrypt");
const crypto = require("crypto");
const usersRouter = require("express").Router();
const User = require("../models/user");
const EmailVerification = require("../models/emailVerification");
const { sendEmail } = require("../utils/mailer");

usersRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({});
    response.json(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", async (request, response, next) => {
  try {
    const { name, username, email, password } = request.body;

    if (!(username && password && email)) {
      return response.status(400).json({
        error: "username, email, and password must be given",
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
      name,
      username,
      email,
      passwordHash,
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
});

module.exports = usersRouter;
