# GapZero Frontend

A modern React application built with Vite for bridging educational gaps for underserved children.

## Tech Stack

- **React** 18+ with Hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Firebase** for authentication
- **Axios** for API calls
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Project Structure

```
src/
├── components/
│   └── common/
│       ├── Navbar.jsx          # Navigation bar with user menu
│       ├── Sidebar.jsx         # Role-based sidebar navigation
│       ├── Layout.jsx          # Layout wrapper
│       ├── ProtectedRoute.jsx  # Route protection component
│       ├── LoadingSpinner.jsx  # Loading indicator
│       ├── StatsCard.jsx       # KPI card component
│       ├── Badge.jsx           # Achievement badge
│       ├── MasteryMap.jsx      # Topic mastery visualization
│       └── StreakCounter.jsx   # Learning streak display
├── config/
│   └── firebase.js             # Firebase configuration
├── context/
│   └── AuthContext.jsx         # Authentication context
├── pages/
│   ├── Landing.jsx             # Landing page
│   ├── Login.jsx               # Login page
│   └── Signup.jsx              # Multi-step signup
├── services/
│   └── api.js                  # Axios API client with interceptors
├── App.jsx                     # Main app component with routes
├── main.jsx                    # React entry point
└── index.css                   # Global styles and Tailwind directives
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file with your Firebase and API configuration:

```bash
cp .env.example .env.local
```

Then fill in your actual values:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

### Authentication
- Google OAuth sign-in via Firebase
- Auto-redirect based on user role
- Token-based API authentication
- Protected routes by role

### Role-Based Access
- **NGO Admin** - Manage students, volunteers, mentors, and view reports
- **Volunteer** - Create and teach learning sessions
- **Mentor** - Guide students and track progress
- **Student** - Learn, take tests, and track achievements

### Key Components

#### Navbar
- Role-specific navigation links
- User profile dropdown
- Mobile hamburger menu
- Responsive design

#### Sidebar
- Context-aware navigation
- Active route highlighting
- Mobile overlay with backdrop
- Smooth animations

#### Dashboard Components
- Stats cards with trends
- Achievement badges
- Mastery maps for topic visualization
- Streak counters for consistency

### API Integration

The `api.js` service provides organized API functions for:

- **Auth**: Login, register, profile management
- **NGO**: Student/volunteer/mentor management
- **Volunteer**: Session and learning path management
- **Mentor**: Student guidance and progress tracking
- **Student**: Profile, classes, tests, and progress
- **Dashboard**: Analytics and reporting

### Custom Colors

The app uses a custom color palette defined in `tailwind.config.js`:

- **Primary** (#1E3A5F) - Navy, main brand color
- **Secondary** (#2E86AB) - Teal, secondary actions
- **Accent** (#F18F01) - Orange, highlights
- **Success** (#2ECC71) - Green, positive actions
- **Danger** (#E74C3C) - Red, destructive actions
- **NGO** (#7C3AED) - Purple, NGO role
- **Mentor** (#2E86AB) - Teal, mentor role
- **Student** (#F18F01) - Orange, student role

## Form Handling

Forms in the signup and profile pages use controlled components with `useState`. Error messages are displayed using `react-hot-toast` notifications.

## Error Handling

- Request interceptor adds Firebase auth token to all API calls
- Response interceptor handles error messages and displays toast notifications
- 401 errors trigger redirect to login
- Network errors are caught and reported to user

## Styling

All components use Tailwind CSS with custom utility classes:

- `.btn-primary`, `.btn-secondary`, `.btn-accent` - Button styles
- `.card`, `.card-hover` - Card components
- `.input-field`, `.label` - Form elements
- `.badge-*` - Badge styles

## Responsive Design

- Mobile-first approach
- Responsive navbar with hamburger menu
- Responsive sidebar that collapses on mobile
- Grid layouts that adapt to screen size
- Tailwind's responsive utilities (sm, md, lg, xl)

## Performance Optimizations

- Vite for fast HMR and optimized builds
- Code splitting via React Router
- Lazy loading of routes
- Tailwind CSS tree-shaking for minimal CSS
- Optimized images and icons (Lucide React)

## Browser Support

Modern browsers with ES2020+ support:
- Chrome
- Firefox
- Safari
- Edge

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Deploy to Vercel, Netlify, etc.

1. Connect your GitHub repository
2. Set environment variables in the hosting platform
3. Deploy (most platforms auto-detect Vite and run `npm run build`)

## Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Keep components focused and reusable
4. Add proper error handling and loading states
5. Use TypeScript for complex components (optional)

## License

MIT
