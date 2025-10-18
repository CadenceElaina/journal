const journalsRouter = require("express").Router();
const Journal = require("../models/journal");
const User = require("../models/user");
const demoRouter = require("express").Router();
const config = require("../utils/config");
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
    const length = 10;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    //create demo user
    const user = new User({
      username,
      passwordHash,
      isDemo: true,
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

    response.status(200).send({
      token,
      user: savedDemoUser,
      username: user.username,
      remainingMs: demoCleanup.DEMO_DURATION,
    });
    //return token + remaining time
  } catch (error) {
    next(error);
  }
});

module.exports = demoRouter;
