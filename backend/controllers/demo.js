const Journal = require("../models/journal");
const User = require("../models/user");
const demoRouter = require("express").Router();
const config = require("../utils/config");
const { generateRandomAlphaNumericString } = require("../utils/middleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const demoJournalEntries = require("../utils/demoJournalData");
const crypto = require("crypto");
const demoCleanup = require("../utils/demoCleanup");

demoRouter.post("/", async (request, response, next) => {
  try {
    //generate unique username
    function generateUniqueUsername() {
      let randomInt = Math.random() * 999999;
      let demoUsername = `demo_${Date.now()}+${randomInt}`;
      return demoUsername;
    }
    let username = generateUniqueUsername();

    //generate secure random password
    let password = generateRandomAlphaNumericString(10);

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    //create demo user
    const user = new User({
      firstName: "Demo",
      lastName: "User",
      username,
      email: `${username}@demo.temp`, // Add fake email for demo users
      passwordHash,
      role: "nonProvider", // Demo users are nonProviders
      isDemo: true,
      isEmailVerified: true, // Demo users don't need email verification
    });
    const savedDemoUser = await user.save();

    const journalsToInsert = demoJournalEntries.map((entry) => ({
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      moods: entry.moods,
      user: savedDemoUser._id,
      wordCount: entry.wordCount,
    }));

    const savedJournals = await Journal.insertMany(journalsToInsert);
    console.log(`${savedJournals.length} journals were successfully saved.`);

    //generate JWT token
    const userForToken = {
      username: savedDemoUser.username,
      id: savedDemoUser._id,
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

    response.status(200).send({
      token,
      refreshToken,
      user: savedDemoUser,
      username: user.username,
      isEmailVerified: true,
      remainingMs: demoCleanup.DEMO_DURATION,
    });
    //return token + remaining time
  } catch (error) {
    next(error);
  }
});

module.exports = demoRouter;
