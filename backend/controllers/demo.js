const journalsRouter = require("express").Router();
const Journal = require("../models/journal");
const User = require("../models/user");
const demoRouter = require("express").Router();
const config = require("../utils/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const demoJournalEntries = require("../utils/demoJournalData");
const cleanUpExpiredDemos = require("../utils/demoCleanup");

demoRouter.get("/", async (request, response, next) => {
  try {
    //generate unique username
    function generateUniqueUsername() {
      let randomInt = Math.random() * 999999;
      let username = `demo_${Date.now}+${randomInt}`;
      return username;
    }
    let demoUsername = generateUniqueUsername();
    let existingUser = await User.findOne({ demoUsername });
    while (existingUser) {
      demoUsername = generateUniqueUsername();
      existingUser = await User.findOne({ demoUsername });
    }

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
      demoUsername,
      passwordHash,
    });
    const savedDemoUser = await user.save();

    const wordCount = [];
    wordCount
      .push(
        demoJournalEntries.map((entry, i) => {
          entry.content.split(/\s+/);
        })
      )
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    const journal = demoJournalEntries.map((entry, i) => {
      new Journal({
        title: entry.title,
        content: entry.content,
        tags: entry.tags,
        moods: entry.moods,
        user: savedDemoUser._id,
        wordCount: wordCount,
      });
    });

    const savedJournal = await journal.save();

    //generate JWT token
    const passwordCorrect =
      savedDemoUser === null
        ? false
        : await bcrypt.compare(password, savedDemoUser.passwordHash);

    if (!(savedDemoUser && passwordCorrect)) {
      return response.status(401).json({
        error: "invalid username or password",
      });
    }

    const userForToken = {
      username: savedDemoUser.username,
      id: savedDemoUser._id,
    };

    const token = jwt.sign(userForToken, config.SECRET, {
      expiresIn: 60 * 60,
    });
    cleanUpExpiredDemos();
    response
      .status(200)
      .send({ token, name: user.name, username: user.username });
    //return token + remaining time
    response.status(201).json(savedDemoUser);
  } catch (error) {
    next(error);
  }
});
