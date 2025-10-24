# Frontend Project Structure

This project follows a **feature-based architecture** for better organization and scalability.

## Directory Structure

```
src/
├── assets/                  # Static assets (images, fonts, etc.)
├── components/              # Shared/global components
│   ├── common/             # Reusable UI components (Header, ThemeSelector)
│   └── layout/             # Layout components (Layout wrapper)
├── features/               # Feature modules (domain-driven)
│   ├── auth/              # Authentication feature
│   │   ├── components/    # Auth-specific components (LoginForm, SignUpForm, etc.)
│   │   ├── context/       # Auth state management (AuthContext, etc.)
│   │   ├── hooks/         # Auth-specific hooks (useForm)
│   │   └── pages/         # Auth pages (Login, SignUp, ResetAuth)
│   ├── demo/              # Demo system feature
│   │   ├── components/    # Demo-specific components
│   │   └── pages/         # Demo pages
│   ├── journal/           # Journal feature
│   │   ├── components/    # Journal components (JournalList, JournalEntryForm)
│   │   ├── context/       # Journal state (JournalsContext)
│   │   ├── hooks/         # Journal-specific hooks
│   │   └── pages/         # Journal pages (Dashboard)
│   ├── settings/          # Settings feature
│   │   ├── modals/        # Settings modals (DeleteAccountModal)
│   │   └── pages/         # Settings pages
│   └── theme/             # Theme feature
│       ├── hooks/         # Theme hooks
│       ├── ThemeContext.jsx
│       └── themes.js
├── hooks/                  # Global/shared custom hooks
├── services/              # API service layer
│   ├── auth.js           # Auth API calls
│   ├── emailVerification.js
│   ├── journals.js       # Journal API calls
│   └── users.js          # User API calls
├── styles/                # Global styles
├── utils/                 # Utility functions
├── config.js             # App configuration
├── App.jsx               # Main App component with routes
└── main.jsx              # Application entry point

```

## Feature Module Pattern

Each feature follows this structure:
```
feature/
├── components/    # Feature-specific UI components
├── context/       # Feature state management
├── hooks/         # Feature-specific hooks
├── pages/         # Feature page components
└── [feature].css  # Feature styles (if needed)
```

## Benefits of This Structure

1. **Scalability**: Easy to add new features without cluttering root directories
2. **Maintainability**: Related code is co-located by feature
3. **Reusability**: Shared components and services are easily accessible
4. **Team Collaboration**: Different developers can work on different features
5. **Code Organization**: Clear separation between features, pages, and components

## Naming Conventions

- **Components**: PascalCase (e.g., `LoginForm.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useForm.jsx`)
- **Context**: PascalCase with `Context` suffix (e.g., `AuthContext.jsx`)
- **Services**: camelCase (e.g., `auth.js`)
- **Pages**: PascalCase (e.g., `Dashboard.jsx`)

## Import Examples

```jsx
// Importing from features
import { useAuth } from '@/features/auth/context/AuthContext'
import LoginForm from '@/features/auth/components/LoginForm'
import Dashboard from '@/features/journal/pages/Dashboard'

// Importing shared components
import Header from '@/components/common/Header'
import Layout from '@/components/layout/Layout'

// Importing services
import authService from '@/services/auth'
import journalService from '@/services/journals'
```

## Recent Reorganization (Oct 2024)

- ✅ Moved auth forms to `features/auth/components/`
- ✅ Moved journal components to `features/journal/components/`
- ✅ Created hooks directories in each feature
- ✅ Updated all import paths
- ✅ Established feature-based folder structure
