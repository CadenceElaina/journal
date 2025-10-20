const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const nodeCron = require("node-cron");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");
const demoCleanup = require("./utils/demoCleanup");

const authRouter = require("./controllers/auth");
const journalsRouter = require("./controllers/journals");
const usersRouter = require("./controllers/users");
const demoRouter = require("./controllers/demo");

// should mongoose be strictQuery or not?

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .then(() => {
    // cron job
    nodeCron.schedule("*/15 * * * *", () => {
      demoCleanup.cleanUpExpiredDemos();
    });
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/auth", authRouter);
app.use(
  "/api/journals",
  middleware.userExtractor,
  middleware.demoActivityTracker,
  journalsRouter
);
app.use("/api/users", usersRouter);
app.use("/api/demo", demoRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
