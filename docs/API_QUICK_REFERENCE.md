# Backend Quick Reference

## 🚀 Starting the Server

```bash
cd backend
npm run dev  # Development mode with auto-reload
# OR
npm start    # Production mode
```

Server runs on: `http://localhost:9000`

---

## 🔑 API Endpoints Quick Reference

### Authentication (No auth required)

```javascript
POST / api / users; // Register
POST / api / login; // Login (returns token)
GET / api / users; // List all users
```

### Journals (Auth required - add header: `Authorization: Bearer <token>`)

```javascript
GET    /api/journals      // List user's journals (with search/filter/sort/pagination)
GET    /api/journals/:id  // Get single journal
POST   /api/journals      // Create new journal
PUT    /api/journals/:id  // Update journal (ownership required)
DELETE /api/journals/:id  // Delete journal (ownership required)
```

---

## 📝 Request Body Examples

### Register

```json
POST /api/users
{
  "username": "cadence",
  "password": "securePassword123",
  "name": "Cadence Anderson"
}
```

### Login

```json
POST /api/login
{
  "username": "John",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "John",
  "name": "John Doe"
}
```

### Create Journal

```json
POST /api/journals
Headers: { "Authorization": "Bearer <token>" }
{
  "title": "My First Journal Entry",
  "content": "Today was a great day! I learned so much about fullstack development.",
  "tags": ["coding", "learning", "fullstack"],
  "moods": ["excited", "motivated", "happy"]
}

Response:
{
  "id": "67123abc...",
  "title": "My First Journal Entry",
  "content": "Today was a great day!...",
  "tags": ["coding", "learning", "fullstack"],
  "moods": ["excited", "motivated", "happy"],
  "wordCount": 12,
  "user": "67123def...",
  "createdAt": "2024-10-16T14:30:00.000Z",
  "updatedAt": "2024-10-16T14:30:00.000Z"
}
```

### Update Journal

```json
PUT /api/journals/:id
Headers: { "Authorization": "Bearer <token>" }
{
  "title": "Updated Title",
  "content": "Updated content here",
  "tags": ["updated", "tags"],
  "moods": ["reflective"]
}
```

---

## 🔍 Query Parameters for GET /api/journals

### Search

```
?term=happiness              // Search in title and content
```

### Filter by Tags

```
?tags=coding,learning        // Must have ALL these tags
```

### Filter by Moods

```
?moods=happy,excited         // Must have ANY of these moods
```

### Filter by Date

```
?date=2024-10-16                              // Exact date
?startDate=2024-10-01&endDate=2024-10-31     // Date range
```

### Sort

```
?sort=newest          // Default - most recent first
?sort=oldest          // Oldest first
?sort=alpha           // Alphabetical by title
?sort=edited          // Recently edited first
?sort=wordcount_desc  // Longest entries first
?sort=wordcount_asc   // Shortest entries first
```

### Pagination

```
?page=1&limit=10      // Default - page 1, 10 per page
?page=2&limit=20      // Page 2, 20 per page
```

### Combine Everything!

```
GET /api/journals?term=coding&tags=learning&moods=excited&startDate=2024-10-01&sort=newest&page=1&limit=10
```

Response:

```json
{
  "journals": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalJournals": 47
}
```

---

## 🔐 Authentication Flow

1. **Register**: POST /api/users → Get confirmation
2. **Login**: POST /api/login → Get JWT token
3. **Store Token**: Save token in localStorage/state
4. **Use Token**: Include in all journal requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
5. **Handle Expiration**: Token expires after 1 hour → redirect to login

---

## ⚠️ Common Errors & Solutions

### 401 Unauthorized

- **Cause**: Missing/invalid/expired token
- **Solution**: Check if token is in header, if expired → re-login

### 404 Not Found

- **Cause**: Journal ID doesn't exist or wrong user
- **Solution**: Verify ID, check if user owns the journal

### 400 Bad Request

- **Cause**: Validation error (missing required fields)
- **Solution**: Check request body has title, content

### 500 Server Error

- **Cause**: Database connection issue or server error
- **Solution**: Check if MongoDB is running, check server logs

---

## 💡 Tips for Frontend Development

1. **Always check for auth token before journal routes**
2. **Handle token expiration gracefully** (redirect to login)
3. **Show both createdAt and updatedAt** in UI (users care about edit dates!)
4. **Use pagination** - don't try to load all journals at once
5. **Implement search/filter UI** - backend already handles it!
6. **Allow multiple selections** for tags and moods
7. **Don't send wordCount** - backend calculates it automatically
8. **Validate on frontend too** - better UX than waiting for server errors

---

## 📊 Data Structure Reference

### Journal Object

```javascript
{
  id: String,              // MongoDB ID (use this, not _id)
  title: String,           // Required
  content: String,         // Required
  tags: [String],          // Array of strings, can be empty
  moods: [String],         // Array of strings, can be empty
  wordCount: Number,       // Auto-calculated
  user: String,            // User ID (reference)
  isShared: Boolean,       // Default false (for Phase 4)
  createdAt: Date,         // Original creation date
  updatedAt: Date          // Last edit date
}
```

### User Object (in responses)

```javascript
{
  id: String,              // MongoDB ID
  username: String,        // Unique
  name: String,            // Optional
  role: String,            // For Phase 4
  createdAt: Date,
  updatedAt: Date
  // passwordHash is NEVER exposed
}
```

---

## 🧪 Testing with Thunder Client / Postman

### 1. Register

```
POST http://localhost:9000/api/users
Body (JSON):
{
  "username": "testuser",
  "password": "test123",
  "name": "Test User"
}
```

### 2. Login

```
POST http://localhost:9000/api/login
Body (JSON):
{
  "username": "testuser",
  "password": "test123"
}

→ Copy the token from response
```

### 3. Create Journal

```
POST http://localhost:9000/api/journals
Headers:
  Authorization: Bearer <paste-token-here>
  Content-Type: application/json
Body (JSON):
{
  "title": "Test Entry",
  "content": "This is a test journal entry with some content.",
  "tags": ["test"],
  "moods": ["curious"]
}
```

### 4. Get All Journals

```
GET http://localhost:9000/api/journals
Headers:
  Authorization: Bearer <paste-token-here>
```

### 5. Search/Filter

```
GET http://localhost:9000/api/journals?term=test&moods=curious
Headers:
  Authorization: Bearer <paste-token-here>
```
