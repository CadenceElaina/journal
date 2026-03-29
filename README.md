# Journal

A full-stack journaling application built with the MERN stack, featuring production-grade authentication (JWT rotation, TOTP 2FA, account lockout), full-text search, and a rich text editor. Designed with a layered backend architecture and feature-based frontend organization.

**Built with:** React 19 · Express v5 · MongoDB · JWT · Tiptap · Vite

---

## Features

### Authentication & Security

- JWT access/refresh token rotation with cross-tab synchronization (Web Locks API → BroadcastChannel → localStorage fallback)
- TOTP-based two-factor authentication with QR code setup and hashed backup codes
- Account lockout after repeated failed login attempts
- Password reset and email verification via time-limited codes
- Rate limiting on auth, registration, email verification, and 2FA endpoints
- Security headers (Helmet.js: CSP, HSTS, XSS protection), input validation/sanitization (express-validator), and log redaction of sensitive fields

### Journal System

- CRUD with per-user ownership verification
- Full-text search across title and content (MongoDB text indexes)
- Filter by tags, moods, and date ranges; sort by date, edit time, title, or word count
- Pagination with configurable page size
- Rich text editing (Tiptap), mood tracking (three-tier mood wheel + custom moods), tag system with suggestions, word count

### User Management

- Registration with email verification flow
- Profile management (name, username, email, password)
- Role-based architecture with provider onboarding flow
- Account deletion with cascading data cleanup

### Demo System

- One-click demo access with seeded data, isolated sessions, and automatic cleanup (cron, 30-minute expiration)

---

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 19, Vite, React Router v7, Context API, Tiptap |
| Backend    | Node.js, Express v5, Mongoose                        |
| Database   | MongoDB (text indexes, TTL indexes)                  |
| Auth       | JWT, bcrypt, speakeasy (TOTP), qrcode                |
| Security   | Helmet.js, express-rate-limit, express-validator     |
| Email      | Nodemailer (Gmail SMTP)                              |
| Testing    | Jest, Supertest, mongodb-memory-server               |
| Scheduling | node-cron                                            |

---

## Architecture

### Project Structure

```
backend/
├── controllers/     # Route handlers (auth, journals, users, 2FA, demo, email verification)
├── models/          # Mongoose schemas (User, Journal, PasswordReset, EmailVerification)
├── tests/           # Integration tests (Jest + Supertest + in-memory MongoDB)
├── utils/           # Middleware, config, validators, rate limiters, mailer, logger

src/
├── features/        # Feature modules (auth, journal, settings, demo, onboarding)
│   └── <feature>/   # components/, context/, hooks/, pages/, styles/, utils/, constants/
├── routes/          # Route config with auth protection and role-based access
├── services/        # API service layer (Axios interceptors, token refresh)
├── shared/          # Shared components (Header, Layout, Modal, RichTextEditor), styles, theme system
```

### Key Design Decisions

- **Separate User and Journal collections** — avoids 16MB document limits and enables independent querying/indexing
- **Refresh token rotation** — every refresh invalidates the previous token, limiting the attack window if a token is compromised
- **Cross-tab token synchronization** — three-tier fallback (Web Locks API → BroadcastChannel → localStorage) prevents race conditions when multiple tabs attempt simultaneous token refresh
- **TTL indexes** on verification/reset documents — automatic expiration handled at the database level without application-side cleanup logic
- **Feature-based frontend architecture** — each feature owns its components, context, hooks, pages, and styles for maintainability

---

## API Endpoints

### Auth

| Method | Endpoint                            | Description                  |
| ------ | ----------------------------------- | ---------------------------- |
| POST   | `/api/auth/login`                   | Login with optional 2FA      |
| POST   | `/api/auth/refresh`                 | Rotate access/refresh tokens |
| POST   | `/api/auth/logout`                  | Invalidate refresh token     |
| POST   | `/api/auth/forgot-password/request` | Send password reset code     |
| POST   | `/api/auth/password-reset/verify`   | Verify reset code            |
| POST   | `/api/auth/password-reset/reset`    | Reset password               |

### Two-Factor Authentication

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| POST   | `/api/2fa/setup`        | Generate TOTP secret + QR code          |
| POST   | `/api/2fa/verify-setup` | Confirm 2FA with backup code generation |
| POST   | `/api/2fa/verify-login` | Verify TOTP token or backup code        |

### Journals

| Method | Endpoint            | Description                                    |
| ------ | ------------------- | ---------------------------------------------- |
| GET    | `/api/journals`     | List journals (search, filter, sort, paginate) |
| GET    | `/api/journals/:id` | Get journal (ownership check)                  |
| POST   | `/api/journals`     | Create journal                                 |
| PUT    | `/api/journals/:id` | Update journal (ownership check)               |
| DELETE | `/api/journals/:id` | Delete journal (ownership check)               |

### Users

| Method | Endpoint                      | Description                            |
| ------ | ----------------------------- | -------------------------------------- |
| POST   | `/api/users`                  | Register new user                      |
| GET    | `/api/users/profile`          | Get current user profile               |
| PATCH  | `/api/users/profile`          | Update profile                         |
| PATCH  | `/api/users/profile/password` | Change password                        |
| PATCH  | `/api/users/profile/email`    | Change email (triggers reverification) |
| DELETE | `/api/users/account`          | Delete account + all associated data   |

### Email Verification & Demo

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| POST   | `/api/email-verification/send`   | Send verification email |
| POST   | `/api/email-verification/verify` | Verify email code       |
| POST   | `/api/demo`                      | Create demo session     |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# Clone
git clone https://github.com/CadenceElaina/journal.git
cd journal

# Backend
cd backend
npm install
# Create .env with the variables listed below
npm run dev

# Frontend (separate terminal)
cd ..
npm install
npm run dev
```

### Environment Variables

| Variable         | Description                    |
| ---------------- | ------------------------------ |
| `PORT`           | Backend server port            |
| `MONGODB_URI`    | MongoDB connection string      |
| `SECRET`         | JWT access token secret        |
| `REFRESH_SECRET` | JWT refresh token secret       |
| `EMAIL`          | Gmail address for sending mail |
| `EMAIL_PASSWORD` | Gmail app password             |

### Testing

```bash
cd backend
npm test
```

Tests run against an in-memory MongoDB instance via `mongodb-memory-server` — no external database required.

**59 integration tests across 4 suites:**

| Suite    | Tests | Covers                                                                              |
| -------- | ----- | ----------------------------------------------------------------------------------- |
| Auth     | 13    | Login, token rotation, refresh invalidation, account lockout, logout                |
| Journals | 25    | CRUD, ownership verification, pagination, search, sort, filter by tag/mood          |
| Users    | 15    | Registration validation, duplicate detection, email normalization, account deletion |
| Demo     | 6     | Session creation, data seeding, isolation between sessions, access control          |

---

## Deployment

### Render (one-click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/CadenceElaina/journal)

A `render.yaml` blueprint is included. Set the required environment variables in the Render dashboard after deploying.

### Manual

```bash
# Build frontend → backend/dist
npm install && npm run build

# Install backend dependencies
cd backend && npm install

# Start (NODE_ENV=production serves frontend + API from one process)
npm start
```
