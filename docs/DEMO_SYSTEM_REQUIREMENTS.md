# Demo System Requirements & Architecture

## Overview

Implement an isolated demo session system that allows visitors to experience the full application without creating a permanent account. Each demo session is independent, with automatic cleanup after a defined period.

---

## Goals

1. **Zero Friction**: Visitors can try the app with one click
2. **Full Functionality**: Demo users experience real CRUD operations
3. **Isolation**: Each demo session is independent (no cross-contamination)
4. **Auto-Cleanup**: Sessions expire and data is cleaned up automatically
5. **Reusability**: Architecture can be applied to future auth-based projects

---

## User Experience Flow

### Landing Page

```
┌─────────────────────────────────────┐
│   Welcome to Journal App            │
│                                     │
│   [Try Demo Session]  ← New feature │
│   [Login]                           │
│   [Sign Up]                         │
└─────────────────────────────────────┘
```

### Demo Session Flow

```
1. User clicks "Try Demo Session"
2. Backend creates temporary demo user (demo_TIMESTAMP_RANDOM)
3. Backend seeds initial demo data (sample journals)
4. Frontend receives token and redirects to app
5. User experiences full app functionality
6. Session expires after X minutes of inactivity
7. Cleanup job removes demo user and their data
```

---

## Technical Requirements

### Backend Requirements

#### 1. Demo User Creation Endpoint

```javascript
POST / api / demo / create;
```

**Functionality:**

- Generate unique temporary username (e.g., `demo_1697546400_abc123`)
- Generate secure random password (not exposed to frontend)
- Create demo user in database with special flag `isDemo: true`
- Seed initial demo journal entries (3-5 entries with varied data)
- Set expiration timestamp (e.g., 30 minutes from now)
- Generate JWT token
- Return token to frontend

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "demo_1697546400_abc123",
  "expiresAt": "2024-10-17T15:30:00.000Z",
  "message": "Demo session created. Your session will expire in 30 minutes."
}
```

#### 2. Demo User Cleanup

Cron Job

- Scheduled task runs every X minutes (e.g., every 15 minutes)
- Finds all demo users with expired sessions
- Deletes demo journals first (cascade delete)
- Deletes demo users
- Logs cleanup results

#### 3. User Model Updates

**Add Fields:**

```javascript
{
  username: String,
  passwordHash: String,
  name: String,
  role: String,
  isDemo: Boolean,        // NEW: Identifies demo users
  demoExpiresAt: Date,    // NEW: When demo session expires
  lastActivity: Date,     // NEW: Track activity for inactivity timeout
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Middleware Updates

**Activity Tracker Middleware:**

```javascript
// Updates lastActivity timestamp on each request
// Only for demo users
```

**Demo Session Validator:**

```javascript
// Checks if demo session is still valid
// Returns 403 if expired
// Optionally extends session on activity
```

#### 5. Cleanup Service

**New File: `/backend/utils/demoCleanup.js`**

Responsibilities:

- Find expired demo users
- Delete their journals (cascade)
- Delete demo users
- Log cleanup activity
- Handle errors gracefully

---

### Frontend Requirements

#### 1. Landing Page Component

```javascript
// New component: pages/Landing.jsx or pages/Welcome.jsx
```

**Features:**

- Hero section explaining the app
- Three clear CTAs:
  - "Try Demo Session" (primary)
  - "Login"
  - "Sign Up"
- Brief feature highlights
- Demo session info (auto-cleanup notice)

#### 2. Demo Service

```javascript
// New file: services/demoService.js
```

**Responsibilities:**

- Call `/api/demo/create`
- Store demo token in localStorage
- Store expiration time
- Handle demo session expiration
- Show countdown/warning before expiration

#### 3. Demo Session Indicator

**UI Component:**

```javascript
// Shows: "Demo Session - Expires in 23:45"
// Yellow/orange banner at top of app
// Countdown timer
// "Sign Up to Save Your Work" button
```

#### 4. Session Expiration Handling

**Behavior:**

- Check expiration on app load
- Check on each API call
- Show warning at 5 minutes remaining
- Redirect to landing page on expiration
- Clear localStorage
- Show message: "Your demo session has expired"

---

## Database Schema Changes

### User Model

```javascript
const userSchema = mongoose.Schema(
  {
    name: String,
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },
    passwordHash: String,
    role: String,
    isDemo: {
      type: Boolean,
      default: false,
      index: true, // For efficient cleanup queries
    },
    demoExpiresAt: {
      type: Date,
      index: true, // For efficient cleanup queries
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup queries
userSchema.index({ isDemo: 1, demoExpiresAt: 1 });
```

### Journal Model

```javascript
// No changes needed - cascading delete handles cleanup
```

---

## Configuration

### Environment Variables

```bash
# Add to .env
DEMO_SESSION_DURATION=30  # Minutes
DEMO_CLEANUP_INTERVAL=15  # Minutes
DEMO_WARNING_TIME=5       # Minutes before expiration to warn user
```

### Demo Data Seeds

**Sample Journals to Create:**

1. **Welcome Entry**

   - Title: "Welcome to Your Demo Journal!"
   - Content: Explains demo features
   - Tags: ["demo", "welcome"]
   - Moods: ["excited", "curious"]

2. **Sample Entry - Recent**

   - Title: "My Thoughts Today"
   - Content: Sample personal reflection
   - Tags: ["reflection", "personal"]
   - Moods: ["thoughtful", "calm"]
   - Date: Today

3. **Sample Entry - Past Week**

   - Title: "Weekend Adventures"
   - Content: Sample story
   - Tags: ["travel", "adventure"]
   - Moods: ["happy", "excited"]
   - Date: 5 days ago

4. **Sample Entry - Past Month**

   - Title: "Goals and Aspirations"
   - Content: Sample goal setting
   - Tags: ["goals", "planning"]
   - Moods: ["motivated", "determined"]
   - Date: 20 days ago

5. **Sample Entry - Longer**
   - Title: "A Detailed Reflection"
   - Content: Longer sample (to showcase word count)
   - Tags: ["reflection", "detailed"]
   - Moods: ["thoughtful"]
   - Date: 15 days ago

---

## Security Considerations

### 1. Demo User Limitations

- Cannot change username/password
- Cannot delete account (auto-deleted)
- Session bound to IP? (optional, for extra security)
- Rate limiting on demo creation (prevent abuse)

### 2. Rate Limiting

```javascript
// Prevent demo session spam
// Max 5 demo sessions per IP per hour
```

### 3. Resource Protection

```javascript
// Limit demo user journal entries to 50 max
// Prevent demo users from creating excessive data
```

### 4. Cleanup Safety

```javascript
// Only delete users where isDemo === true
// Double-check before deletion
// Log all deletions
```

---

## Implementation Phases

### Phase 1.5a: Backend Demo System (First)

**Estimated Time: 2-3 hours**

- [x] Update User model with demo fields (isDemo, lastActivity, compound index)
- [x] Create demo creation endpoint (POST /api/demo with unique username generation)
- [x] Seed demo data function (5 sample journals with varied dates)
- [x] Create cleanup service (finds expired demos, deletes journals then users)
- [x] Schedule cleanup with node-cron (every 15 minutes after DB connection)
- [ ] Add activity tracking middleware (update lastActivity on each request)
- [ ] Test demo creation endpoint
- [ ] Test cleanup job (with short duration for testing)

### Phase 1.5b: Frontend Demo UI (Second)

**Estimated Time: 2-3 hours**

- [ ] Create Landing/Welcome page
- [ ] Create demo service
- [ ] Add "Try Demo" button
- [ ] Implement session expiration handling
- [ ] Add demo session indicator banner
- [ ] Add countdown timer
- [ ] Test full demo flow

### Phase 1.5c: Polish & Testing (Third)

**Estimated Time: 1-2 hours**

- [ ] Add rate limiting
- [ ] Add error handling for demo creation failures
- [ ] Test concurrent demo sessions
- [ ] Test cleanup during active sessions
- [ ] Verify no data leaks between sessions
- [ ] Document demo system in README

---

## Testing Checklist

### Backend Tests

- [ ] Demo user created successfully
- [ ] Demo users have unique usernames
- [ ] Demo journals seeded correctly
- [ ] Cleanup removes expired demo users
- [ ] Cleanup removes demo user journals
- [ ] Cleanup doesn't touch real users
- [ ] Activity tracking updates correctly
- [ ] Expired sessions return 403

### Frontend Tests

- [ ] Demo button creates session
- [ ] Token stored correctly
- [ ] Redirect to app works
- [ ] Demo banner displays
- [ ] Countdown timer accurate
- [ ] Warning shows at 5 minutes
- [ ] Expiration redirects to landing
- [ ] Can create new demo session after expiration

### Integration Tests

- [ ] Multiple concurrent demo sessions work independently
- [ ] One demo user's changes don't affect another
- [ ] Cleanup doesn't interrupt active sessions
- [ ] Real users unaffected by demo system

---

## API Endpoints Summary

### New Endpoints

```
POST   /api/demo/create        - Create demo session
GET    /api/demo/status        - Check demo session status (optional)
DELETE /api/demo/cleanup       - Manual cleanup trigger (admin only, optional)
```

### Modified Endpoints

```
None - existing endpoints work with demo users automatically
```

---

## Future Enhancements (Phase 4)

When roles are implemented:

### Multiple Demo Profiles

```
Landing Page:
  [Try Demo - Personal Journal]    ← Client role
  [Try Demo - Professional View]   ← Therapist role
  [Login]
  [Sign Up]
```

### Role-Specific Demo Data

- Client demo: Personal journal entries
- Therapist demo: Client list, shared journals, prompts

---

## Success Metrics

### User Experience

- ✅ Demo session created in < 2 seconds
- ✅ Users can perform all CRUD operations
- ✅ No confusion about demo vs real accounts
- ✅ Clear expiration warnings

### Technical

- ✅ No data leaks between sessions
- ✅ Cleanup runs reliably
- ✅ No impact on real user performance
- ✅ Session isolation verified

### Business

- ✅ Increased portfolio engagement
- ✅ Lower barrier to entry
- ✅ Showcases full stack skills

---

## Notes

- Demo system adds complexity - worth it for portfolio impact
- Architecture is reusable for future projects
- Demonstrates understanding of session management
- Shows UX awareness (removing friction)
- Highlights security knowledge (isolation, cleanup)

---

## Questions to Consider During Implementation

1. **Session Extension**: Should activity extend the demo session?
2. **Data Limits**: Max journals per demo user?
3. **IP Tracking**: Track by IP to prevent spam?
4. **Cleanup Strategy**: Immediate on expiry vs scheduled batches?
5. **Error Handling**: What if cleanup fails? Retry mechanism?
6. **Monitoring**: How to track demo usage analytics?

---

## Resources & References

- Node-cron for scheduled cleanup
- JWT token expiration handling
- MongoDB TTL indexes (alternative to cron)
- Session management best practices
