# GapZero Frontend - Setup and Development Guide

## Quick Start

### Prerequisites
- Node.js 16+ (recommended 18+)
- npm or yarn
- Firebase project with Google Auth enabled

### 1. Installation

```bash
cd /sessions/nifty-magical-gauss/mnt/Hackathon/gapzero/frontend
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env.local
```

Get your Firebase credentials from Firebase Console and add them to `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## File Structure Overview

### Configuration Files
- `vite.config.js` - Vite configuration with React plugin
- `tailwind.config.js` - Tailwind CSS theme with GapZero custom colors
- `postcss.config.js` - PostCSS plugins for Tailwind and autoprefixer
- `package.json` - Dependencies and scripts
- `index.html` - HTML entry point

### Source Files

#### Entry Point
- `src/main.jsx` - React app initialization with providers
- `src/App.jsx` - Main router and route definitions

#### Configuration
- `src/config/firebase.js` - Firebase initialization and auth provider setup

#### Context
- `src/context/AuthContext.jsx` - Authentication state management with custom hooks

#### Services
- `src/services/api.js` - Axios instance with interceptors and organized API endpoints

#### Components
All reusable components in `src/components/common/`:
- `Navbar.jsx` - Top navigation with user menu (responsive)
- `Sidebar.jsx` - Role-based navigation sidebar
- `Layout.jsx` - Layout wrapper combining Navbar + Sidebar + content
- `ProtectedRoute.jsx` - Route protection by auth + role
- `LoadingSpinner.jsx` - Loading indicator component
- `StatsCard.jsx` - KPI card with icon, value, trend
- `Badge.jsx` - Achievement badge display
- `MasteryMap.jsx` - Topic mastery grid visualization
- `StreakCounter.jsx` - Learning consistency tracker

#### Pages
- `src/pages/Landing.jsx` - Public landing page with hero, how-it-works, impact stats
- `src/pages/Login.jsx` - Google OAuth login
- `src/pages/Signup.jsx` - Multi-step role selection and profile creation

#### Styles
- `src/index.css` - Tailwind directives and custom utility classes

## Authentication Flow

### Google Sign-In Flow
1. User clicks "Sign in with Google"
2. Firebase popup appears
3. User authenticates with Google
4. `loginWithGoogle()` in AuthContext is called
5. Token is sent to backend for verification
6. If user exists: Redirect to role dashboard
7. If user is new: Redirect to signup page
8. Signup form collects role-specific details
9. Account is created in backend
10. User is redirected to their role dashboard

### Protected Routes
- All authenticated pages are wrapped with `ProtectedRoute`
- Route checks `isAuthenticated` and `role` state
- Redirects to login if not authenticated
- Redirects to home if role doesn't match

## API Integration

### Request Flow
1. Component calls `api.ngo.getStudents()`, etc.
2. Request interceptor attaches Firebase token
3. Request is sent to backend with auth header
4. Response interceptor handles errors and success
5. Errors show toast notifications
6. Success returns data to component

### Available API Functions

**Auth**
- `api.auth.register()` - Create new user account
- `api.auth.login()` - Verify token and get user profile
- `api.auth.getMe()` - Get current user profile
- `api.auth.updateProfile()` - Update user profile

**NGO**
- `api.ngo.create()` - Register new NGO
- `api.ngo.get()` - Get NGO details
- `api.ngo.getDashboard()` - Get NGO dashboard stats
- `api.ngo.getStudents()` - List students
- `api.ngo.getVolunteers()` - List volunteers
- `api.ngo.getMentors()` - List mentors
- And more...

**Volunteer, Mentor, Student, Test, Dashboard**
- Organized API functions for each role
- See `src/services/api.js` for complete list

## Routing Structure

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/test/:testId` - Public test taking

### Protected Routes (by role)

**NGO** (`/ngo/*`)
- `/ngo/dashboard` - Overview and stats
- `/ngo/students` - Student management
- `/ngo/volunteers` - Volunteer management
- `/ngo/mentors` - Mentor management
- `/ngo/reports` - Reports and analytics

**Volunteer** (`/volunteer/*`)
- `/volunteer/dashboard` - Overview
- `/volunteer/sessions` - Teaching sessions
- `/volunteer/learning-path` - Learning content
- `/volunteer/students` - Student list
- `/volunteer/test-results` - Test analytics

**Mentor** (`/mentor/*`)
- `/mentor/dashboard` - Overview
- `/mentor/students` - Student list
- `/mentor/schedule` - Meeting schedule
- `/mentor/alerts` - Alerts and notifications
- `/mentor/notes` - Student notes

**Student** (`/student/*`)
- `/student/dashboard` - Overview
- `/student/classes` - Class list
- `/student/tests` - Available tests
- `/student/progress` - Progress tracking
- `/student/mentor` - Mentor info
- `/student/badges` - Achievements

## Custom Colors

GapZero uses a custom color palette accessible in components:

```jsx
// Using colors in className
<div className="bg-primary-600 text-secondary-50">
  <button className="btn-accent">Click me</button>
</div>

// Tailwind supports all colors with opacity
<div className="bg-primary-600/50">Transparent primary</div>
```

Colors:
- `primary` - Navy (#1E3A5F)
- `secondary` - Teal (#2E86AB)
- `accent` - Orange (#F18F01)
- `success` - Green (#2ECC71)
- `danger` - Red (#E74C3C)
- `ngo` - Purple (#7C3AED)
- `mentor` - Teal (#2E86AB)
- `student` - Orange (#F18F01)

## Component Usage Examples

### Stats Card
```jsx
import StatsCard from '@/components/common/StatsCard'
import { Users } from 'lucide-react'

<StatsCard
  icon={Users}
  label="Total Students"
  value="150"
  trend="12"
  trendDirection="up"
  color="primary"
/>
```

### Badge
```jsx
import Badge from '@/components/common/Badge'
import { Trophy } from 'lucide-react'

<Badge
  icon={Trophy}
  name="Math Master"
  dateEarned="2024-03-15"
  description="Completed all math modules"
  color="success"
/>
```

### Mastery Map
```jsx
import MasteryMap from '@/components/common/MasteryMap'

const topics = [
  { name: 'Algebra', level: 'mastered', percentage: 100 },
  { name: 'Geometry', level: 'proficient', percentage: 85 },
  { name: 'Calculus', level: 'learning', percentage: 45 },
]

<MasteryMap topics={topics} />
```

### Streak Counter
```jsx
import StreakCounter from '@/components/common/StreakCounter'

<StreakCounter count={7} goal={30} message="Keep learning daily!" />
```

## Form Handling

Forms use React hooks for state management:

```jsx
const [formData, setFormData] = useState({})

const handleInputChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const response = await api.ngo.create(formData)
    toast.success('Created successfully!')
  } catch (error) {
    toast.error('Failed to create')
  }
}
```

## Notifications

Using react-hot-toast for notifications:

```jsx
import toast from 'react-hot-toast'

// Success
toast.success('Operation successful!')

// Error
toast.error('Something went wrong')

// Custom
toast.custom(<CustomComponent />)
```

## Development Tips

### Hot Module Replacement (HMR)
- Vite provides instant HMR
- Changes to components reflect immediately
- State is preserved during reloads

### Debugging
- Use React Developer Tools browser extension
- Check Firebase Auth console
- Monitor network requests in DevTools
- Check console for errors

### Common Issues

**Firebase Authentication Error**
- Verify Firebase credentials in `.env.local`
- Check Firebase console for Google OAuth setup
- Ensure redirect URLs are configured

**API Errors**
- Check backend is running on `VITE_API_BASE_URL`
- Verify Firebase token format in requests
- Check backend error responses in Network tab

**Styling Issues**
- Clear browser cache
- Rebuild CSS with `npm run build`
- Check Tailwind config is loaded

## Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

Output is in `dist/` folder ready for deployment.

## Deployment

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Project Standards

### Code Style
- Use functional components with hooks
- Keep components focused and reusable
- Use descriptive variable names
- Add comments for complex logic

### File Organization
- Group related files together
- Use consistent naming conventions
- Keep files under 300 lines
- Extract complex logic into utilities

### Component Props
- Use PropTypes or TypeScript (optional)
- Document required vs optional props
- Provide sensible defaults

### Error Handling
- Always handle errors in async operations
- Show user-friendly error messages
- Log errors for debugging
- Use toast notifications for feedback

## Next Steps

1. Set up backend server (Node.js/Express)
2. Create role-specific dashboard pages
3. Implement actual API endpoints
4. Add more form validations
5. Create reusable form components
6. Add unit and integration tests
7. Set up CI/CD pipeline

## Support

For issues or questions:
1. Check the README.md
2. Review component documentation
3. Check browser console for errors
4. Verify Firebase and API configuration
5. Check network requests in DevTools

Happy coding!
