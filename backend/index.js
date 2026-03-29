const mongoose = require("mongoose");
const nodeCron = require("node-cron");
const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");
const demoCleanup = require("./utils/demoCleanup");

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");

    nodeCron.schedule("*/15 * * * *", () => {
      demoCleanup.cleanUpExpiredDemos();
    });

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
    });
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });
