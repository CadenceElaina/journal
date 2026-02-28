# Journal

A full-stack journaling application with a focus on backend architecture, authentication, and security. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

**Authentication & Security**

- JWT access tokens with refresh token rotation
- Two-factor authentication (TOTP) with QR code setup and hashed backup codes
- Account lockout after failed login attempts
- Password reset via email verification codes
- Rate limiting on all sensitive endpoints (auth, registration, email verification, 2FA)
- Security headers via Helmet.js (CSP, HSTS, XSS protection)
- Input validation and sanitization (express-validator)
- Request log sanitization (passwords/tokens redacted)
- Cross-tab token synchronization (Web Locks API / BroadcastChannel / localStorage fallback)

**Journal System**

- Full CRUD operations with ownership verification
- Full-text search across title and content (MongoDB text indexes)
- Filter by tags, moods, and date ranges
- Sort by newest, oldest, recently edited, alphabetical, word count
- Pagination with configurable page size
- Rich text editing with Tiptap
- Mood tracking with a three-tier mood wheel and custom moods
- Tag system with common tag suggestions
- Word count tracking

**User Management**

- Registration with email verification
- Profile management (name, username, email, password)
- Role-based architecture (provider / nonProvider)
- Provider onboarding flow
- Account deletion with cascading data cleanup

**Demo System**

- One-click demo access with seeded journal data
- Isolated demo sessions with automatic cleanup (cron job every 15 minutes)
- Activity tracking with 30-minute expiration

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 19, Vite, React Router v7, Context API, Tiptap |
| Backend    | Node.js, Express v5, Mongoose                        |
| Database   | MongoDB (text indexes, TTL indexes)                  |
| Auth       | JWT, bcrypt, speakeasy (TOTP), qrcode                |
| Security   | Helmet.js, express-rate-limit, express-validator     |
| Email      | Nodemailer (Gmail SMTP)                              |
| Scheduling | node-cron                                            |

## Project Structure

```
backend/
├── controllers/     # Route handlers (auth, journals, users, 2FA, demo, email)
├── models/          # Mongoose schemas (User, Journal, PasswordReset, EmailVerification)
├── utils/           # Middleware, config, validators, rate limiters, mailer, logger
src/
├── features/        # Feature-based modules (auth, journal, settings, demo, onboarding)
├── routes/          # Route config with auth protection and role-based access
├── services/        # API service layer with Axios interceptors
├── shared/          # Shared components, styles, and theme system
```

## API Endpoints

| Method | Endpoint                            | Description                                    |
| ------ | ----------------------------------- | ---------------------------------------------- |
| POST   | `/api/auth/login`                   | Login with optional 2FA                        |
| POST   | `/api/auth/refresh`                 | Rotate access + refresh tokens                 |
| POST   | `/api/auth/logout`                  | Invalidate refresh token                       |
| POST   | `/api/auth/forgot-password/request` | Send password reset code                       |
| POST   | `/api/auth/password-reset/verify`   | Verify reset code                              |
| POST   | `/api/auth/password-reset/reset`    | Reset password                                 |
| POST   | `/api/2fa/setup`                    | Generate TOTP secret + QR code                 |
| POST   | `/api/2fa/verify-setup`             | Confirm 2FA with backup code generation        |
| POST   | `/api/2fa/verify-login`             | Verify 2FA token or backup code on login       |
| GET    | `/api/journals`                     | List journals (search, filter, sort, paginate) |
| GET    | `/api/journals/:id`                 | Get single journal (ownership check)           |
| POST   | `/api/journals`                     | Create journal                                 |
| PUT    | `/api/journals/:id`                 | Update journal (ownership check)               |
| DELETE | `/api/journals/:id`                 | Delete journal (ownership check)               |
| POST   | `/api/users`                        | Register new user                              |
| GET    | `/api/users/profile`                | Get current user profile                       |
| PATCH  | `/api/users/profile`                | Update profile                                 |
| PATCH  | `/api/users/profile/password`       | Change password                                |
| PATCH  | `/api/users/profile/email`          | Change email (triggers verification)           |
| DELETE | `/api/users/account`                | Delete account + all data                      |
| POST   | `/api/demo`                         | Create demo session                            |
| POST   | `/api/email-verification/send`      | Send verification email                        |
| POST   | `/api/email-verification/verify`    | Verify email code                              |

## Getting Started

```bash
# Clone
git clone https://github.com/your-username/journal.git

# Backend
cd backend
npm install
# Create .env with: PORT, MONGODB_URI, SECRET, REFRESH_SECRET, EMAIL, EMAIL_PASSWORD
npm run dev

# Frontend (separate terminal)
cd ..
npm install
npm run dev
```

## Architecture Decisions

- **Separate User and Journal collections** rather than embedded documents to avoid document size limits and enable independent scaling
- **Refresh token rotation** on every refresh to limit attack window if a token is compromised
- **Three-tier cross-tab token synchronization** to prevent race conditions when multiple tabs attempt token refresh simultaneously
- **TTL indexes** on verification and reset documents for automatic cleanup without application logic
- **Feature-based frontend architecture** for maintainability as the app grows
