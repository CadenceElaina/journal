# Client Application Structure

This document outlines the folder structure and organization of the Journal App frontend.

## Overview

The client follows a **feature-based architecture** with shared/common code separated into its own directory. This approach keeps related code together while maintaining clear separation of concerns.

## Root Structure

```
src/
├── features/           # Feature-based modules (auth, journal, settings, etc.)
├── routes/            # Route configuration and protection
├── services/          # API service layer
├── shared/            # Shared/common code across features
├── assets/            # Static assets (images, icons, etc.)
├── App.jsx           # Main application component
└── main.jsx          # Application entry point
```

---

### Feature Structure Pattern

```
features/{feature-name}/
├── components/        # Reusable UI components for this feature
├── pages/            # Route-level page components
├── context/          # Feature-specific React context
├── hooks/            # Custom hooks for this feature
├── modals/           # Feature-specific modal components (optional)
└── styles/           # Feature-specific styles (optional)
```

### Current Features

#### 1. Authentication (`/features/auth`)

**Key Responsibilities:**

- User login/signup/logout
- Email verification flow
- Password reset functionality
- Authentication state management
- Route protection logic

#### 2. Journal (`/features/journal`)

**Key Responsibilities:**

- Creating, reading, updating, deleting journal entries
- Searching and filtering journals by tags, mood, date
- Sorting journals (newest, oldest, title)
- Pagination for journal lists
- Journal state management

#### 3. Settings (`/features/settings`)

**Key Responsibilities:**

- Profile updates (name, email, bio)
- Password change
- Account deletion
- User preferences

#### 4. Demo (`/features/demo`)

**Key Responsibilities:**

- Demo user authentication
- Sample data display
- Demo limitations/restrictions

#### 5. Relationships (`/features/relationships`)

**[Future Implementation]** Therapist-client relationships and journal sharing.

**Planned Responsibilities:**

- Therapist dashboard
- Client management for therapists
- Shared journal access
- Relationship requests/approvals

---

## Routes (`/routes`)

Centralized routing configuration with route protection logic.

```
routes/
├── index.jsx              # Main router configuration
├── AuthRoutes.jsx         # Public authentication routes
├── ProtectedRoutes.jsx    # Authenticated user routes
└── RoleRoutes.jsx         # Role-based routes (therapist/client)
```

**Route Types:**

1. **Public Routes** (`AuthRoutes.jsx`):

   - Login, signup, password reset
   - Redirects authenticated users to dashboard

2. **Protected Routes** (`ProtectedRoutes.jsx`):

   - Requires authentication
   - Journal pages, settings
   - Wraps content in Layout component

3. **Role Routes** (`RoleRoutes.jsx`):
   - Requires specific user roles (therapist, client)
   - Role-specific dashboards and features

---

## Services (`/services`)

API service layer for backend communication. All HTTP requests are centralized here.

```
services/
├── api.js                    # Axios instance + interceptors
├── auth.js                   # Authentication endpoints
├── emailVerification.js      # Email verification endpoints
├── journals.js               # Journal CRUD endpoints
├── users.js                  # User management endpoints
└── index.js                  # Exports all services
```

**Key Features:**

- Centralized axios configuration
- Request/response interceptors for auth tokens
- Error handling
- Consistent API interface

## Design Patterns & Conventions

### Component Organization

**Pages vs Components:**

- **Pages**: Route-level components that handle:

  - Data fetching
  - Layout composition
  - Route parameters
  - Page-level state

- **Components**: Reusable UI pieces that:
  - Accept props
  - Focus on presentation
  - Can be used in multiple contexts
  - Have minimal side effects

### State Management

**Context Usage:**

- Each feature has its own context for feature-specific state
- Shared state (auth, theme) lives in `shared/` or top-level feature
- Avoid prop drilling by using context appropriately

**Context Structure:**

```javascript
// AuthContext.jsx
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // ... auth logic

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth.js
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### Styling Approach

- Global variables and resets in `shared/styles/`
- Feature styles in feature folders
- Theme switching via ThemeContext

## Future Considerations

1. **`/shared/hooks`**: Common custom hooks

   - `useDebounce`
   - `useLocalStorage`
   - `useMediaQuery`

2. **`/shared/constants`**: App-wide constants

   - User roles
   - API endpoints
   - Configuration values

3. **`/shared/utils`**: Utility functions

   - Date formatting
   - Validation helpers
   - String utilities

4. **`/features/relationships`**: Therapist-client features

   - Client management
   - Shared journals
   - Relationship invitations

5. **Test files**: Co-located with components
   - `JournalCard.test.jsx`
   - `useAuth.test.js`
