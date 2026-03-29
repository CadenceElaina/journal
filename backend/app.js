const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const config = require("./utils/config");
const middleware = require("./utils/middleware");

const authRouter = require("./controllers/auth");
const journalsRouter = require("./controllers/journals");
const usersRouter = require("./controllers/users");
const demoRouter = require("./controllers/demo");
const emailVerificationRouter = require("./controllers/emailVerification");
const twoFactorRouter = require("./controllers/twoFactor");

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
        upgradeInsecureRequests: config.NODE_ENV === "production" ? [] : null, // Disable in dev
      },
    },
    hsts:
      config.NODE_ENV === "production"
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false, // Disable HSTS in development
  }),
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
        ? [process.env.FRONTEND_URL]
        : ["http://localhost:5173", "http://localhost:3000"], // Vite default ports
    credentials: true, // Allow cookies/auth headers
    optionsSuccessStatus: 200,
  }),
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
  journalsRouter,
);
app.use("/api/users", usersRouter);
app.use("/api/demo", demoRouter);
app.use("/api/email-verification", emailVerificationRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
