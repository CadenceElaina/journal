const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const nodeCron = require("node-cron");
const helmet = require("helmet");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");
const demoCleanup = require("./utils/demoCleanup");

const authRouter = require("./controllers/auth");
const journalsRouter = require("./controllers/journals");
const usersRouter = require("./controllers/users");
const demoRouter = require("./controllers/demo");
const emailVerificationRouter = require("./controllers/emailVerification");
const twoFactorRouter = require("./controllers/twoFactor");

// should mongoose be strictQuery or not?

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .then(() => {
    // cron job every 15 minutes we check if demo expired and cleanup demo users + their journals
    nodeCron.schedule("*/15 * * * *", () => {
      demoCleanup.cleanUpExpiredDemos();
    });
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

// ============================================================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================================================

// 1. Security headers with Helmet - prevent XSS, clickjacking, MIME sniffing
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"], // API calls
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);

// 2. HTTPS enforcement - redirect HTTP to HTTPS in production
if (config.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// 3. CORS - restrict origins in production
app.use(
  cors({
    origin:
      config.NODE_ENV === "production"
        ? ["https://TODO-MY-DOMAIN.com", "https://www.TODO-MY-DOMAIN.com"]
        : ["http://localhost:5173", "http://localhost:3000"], // Vite default ports
    credentials: true, // Allow cookies/auth headers
    optionsSuccessStatus: 200,
  })
);

// 4. Standard Express middleware
app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// ============================================================================
// ROUTES
// ============================================================================

app.use("/api/auth", authRouter);
app.use("/api/2fa", twoFactorRouter);
app.use(
  "/api/journals",
  middleware.userExtractor,
  middleware.demoActivityTracker,
  journalsRouter
);
app.use("/api/users", usersRouter);
app.use("/api/demo", demoRouter);
app.use("/api/email-verification", emailVerificationRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
