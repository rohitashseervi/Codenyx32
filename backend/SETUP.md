# GapZero Backend - Setup and Documentation

## Overview

This is a complete, production-quality Node.js/Express backend for the GapZero education platform. The system uses MongoDB for data persistence, Firebase for authentication, and includes comprehensive models for managing mentors, students, volunteers, and educational content.

## Files Created

### Core Configuration (3 files)
1. **package.json** - All dependencies with versions
2. **.env.example** - Template for environment variables
3. **config/db.js** - MongoDB connection with Mongoose
4. **config/firebase.js** - Firebase Admin SDK initialization

### Middleware (2 files)
1. **middleware/auth.js** - Firebase token verification and user extraction
2. **middleware/roleCheck.js** - Role-based access control (4 roles: ngo_admin, volunteer, mentor, student)

### Database Models (17 files)
1. **User.js** - Base user model with authentication and login tracking
2. **NGO.js** - Organization with coverage areas and admin assignment
3. **Student.js** - Student profiles with mentor tracking and progress
4. **Volunteer.js** - Volunteer management with schedules and background checks
5. **Mentor.js** - Mentor profiles with expertise and student limits
6. **Match.js** - Mentor-student pairing with quality scoring
7. **ClassGroup.js** - Class sections with enrollment and schedules
8. **LearningModule.js** - Course topics with teaching guides and activities
9. **Session.js** - Teaching sessions with attendance and notes
10. **Assessment.js** - Tests and quizzes with AI-generation readiness
11. **TestResult.js** - Student test answers and scoring
12. **Badge.js** - Achievement badges with earning criteria
13. **StudentBadge.js** - Student badge assignments
14. **LearningPath.js** - Personalized learning sequences

### Utilities and Server (3 files)
1. **utils/logger.js** - Structured logging with file output
2. **server.js** - Express app initialization with middleware
3. **README.md** - Complete documentation

## Key Features

### Authentication
- Firebase ID token verification
- User role assignment (4 types)
- Login attempt tracking with account locking
- Email verification support

### Data Models
All 17 Mongoose models include:
- Proper indexing for performance
- Validation rules
- Virtual fields for computed properties
- Instance methods for business logic
- Static methods for querying
- Timestamps (createdAt, updatedAt)

### Security
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- Firebase token verification
- Input validation

### Logging
- Structured logging with timestamps
- Console output for development
- File persistence for errors and warnings
- Combined log file

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run Server
```bash
npm run dev  # Development with auto-reload
npm start    # Production
```

Server starts on http://localhost:5000

## Database Models Summary

### User (Authentication)
```javascript
{
  firebaseUid: String (unique),
  email: String (unique),
  name: String,
  phone: String,
  role: enum [ngo_admin, volunteer, mentor, student],
  ngoId: ObjectId,
  avatar: String,
  isEmailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### NGO (Organization)
```javascript
{
  name: String,
  description: String,
  missionStatement: String,
  region: String,
  gradesCovered: [1-5],
  subjectsOffered: [String],
  languages: [String],
  adminUserId: ObjectId,
  status: enum [active, inactive, pending_approval],
  stats: {
    totalStudents, totalVolunteers, totalMentors
  }
}
```

### Student (Learner Profile)
```javascript
{
  userId: ObjectId,
  ngoId: ObjectId,
  grade: 1-5,
  school: String,
  language: String,
  currentMentorId: ObjectId,
  baselineScores: { math, evs, language },
  consistencyStreak: Number,
  badges: [ObjectId],
  status: enum [active, inactive, graduated, withdrawn],
  sessionsCompleted: Number,
  attendanceRate: Number
}
```

### Volunteer (Class Teacher)
```javascript
{
  userId: ObjectId,
  ngoId: ObjectId,
  subjects: [String],
  gradeBand: enum [1-2, 2-3, 3-4, 4-5],
  timeSlots: [{ day, startHour, endHour }],
  commitmentDuration: Number (months),
  status: enum [pending, approved, active, inactive],
  backgroundCheck: { status, completedAt, expiresAt },
  performanceMetrics: { feedback, attendance, engagement }
}
```

### Mentor (One-on-One)
```javascript
{
  userId: ObjectId,
  ngoId: ObjectId,
  expertSubjects: [String] (max 2),
  maxStudents: Number,
  currentStudentCount: Number,
  behavioralProfile: { patienceScore, communicationStyle },
  status: enum [pending, approved, active, inactive],
  performanceMetrics: { satisfaction, progress, completionRate },
  feedbackFromStudents: [{ rating, comment, submittedAt }]
}
```

### Match (Mentor-Student Pairing)
```javascript
{
  mentorId: ObjectId,
  studentId: ObjectId,
  ngoId: ObjectId,
  matchScore: Number (0-100),
  matchFactors: { subjectAlignment, languageAlignment, ... },
  subject: String,
  status: enum [pending, active, completed, reassigned],
  studentProgress: { initialScore, finalScore, masteryLevel },
  sessionsCompleted: Number,
  qualityMetrics: { mentorFeedback, studentFeedback }
}
```

### ClassGroup (Group Class)
```javascript
{
  ngoId: ObjectId,
  name: String,
  grade: 1-5,
  subject: String,
  volunteerId: ObjectId,
  students: [ObjectId],
  maxCapacity: Number,
  schedule: { day, startTime, endTime, location },
  curriculum: { modules, startDate, endDate },
  status: enum [planning, active, completed, suspended],
  performanceData: { attendanceRate, averageScores }
}
```

### LearningModule (Course Content)
```javascript
{
  subject: String,
  grade: 1-5,
  topic: String,
  order: Number,
  prerequisites: [ObjectId],
  teachingGuide: String,
  activities: [{ name, description, duration, type, difficulty }],
  estimatedDuration: Number,
  resources: [{ title, type, url }],
  statistics: { timesUsed, averageScore, masteringRate }
}
```

### Session (Teaching Session)
```javascript
{
  classGroupId: ObjectId,
  volunteerId: ObjectId,
  moduleId: ObjectId,
  date: Date,
  scheduledTime: String (HH:MM),
  duration: Number,
  meetLink: String,
  status: enum [scheduled, in_progress, completed, cancelled],
  attendees: {
    volunteerAttended: Boolean,
    studentAttendance: [{ studentId, attended, arrivedAt }]
  },
  content: {
    topicsCovered: [String],
    activitiesCompleted: [String],
    studentEngagementLevel: enum [low, medium, high]
  },
  volunteerNotes: { strengthsObserved, areasForImprovement }
}
```

### Assessment (Test)
```javascript
{
  sessionId: ObjectId,
  moduleId: ObjectId,
  volunteerId: ObjectId,
  ngoId: ObjectId,
  title: String,
  subject: String,
  grade: 1-5,
  difficulty: enum [easy, medium, hard],
  totalQuestions: Number,
  questions: [{ questionText, questionType, options, correctAnswer }],
  testId: String (unique for sharing),
  status: enum [draft, created, active, completed],
  studentIds: [ObjectId],
  statistics: { totalSubmissions, averageScore, passRate }
}
```

### TestResult (Student Test Score)
```javascript
{
  assessmentId: ObjectId,
  studentId: ObjectId,
  ngoId: ObjectId,
  answers: [{ questionId, studentAnswer, isCorrect, pointsObtained }],
  score: Number (0-100),
  correctAnswers: Number,
  timeTaken: Number (seconds),
  masteryLevel: enum [needs_help, developing, mastered],
  feedback: { automaticFeedback, volunteerFeedback },
  studentReflection: { howWasIt, whatWasDifficult },
  mentorNotified: Boolean
}
```

### Badge (Achievement)
```javascript
{
  name: String,
  description: String,
  type: enum [performance, consistency, milestone, achievement],
  criteria: Map,
  iconUrl: String,
  color: String (#RRGGBB),
  points: Number,
  rarity: enum [common, uncommon, rare, epic, legendary],
  requirements: { minScore, minSessions, requiredSubjects },
  statistics: { totalEarned, earnRate, lastEarnedAt }
}
```

### StudentBadge (Award Tracking)
```javascript
{
  studentId: ObjectId,
  badgeId: ObjectId,
  ngoId: ObjectId,
  earnedAt: Date,
  earnedThrough: enum [automatic, manual, mentor_awarded],
  awardedBy: ObjectId,
  testResultId: ObjectId,
  notificationSent: Boolean
}
```

### LearningPath (Personalized Sequence)
```javascript
{
  volunteerId: ObjectId,
  classGroupId: ObjectId,
  ngoId: ObjectId,
  subject: String,
  grade: 1-5,
  modules: [{
    moduleId: ObjectId,
    scheduledDate: Date,
    status: enum [pending, in_progress, completed, skipped],
    assessmentScore: Number
  }],
  startDate: Date,
  endDate: Date,
  completionPercentage: Number,
  pacing: { actualPace, modulesPerWeek },
  learningOutcomes: { achieved, pending, notAchieved }
}
```

## Middleware

### authenticateToken
Verifies Firebase token and extracts user from database:
```javascript
const { authenticateToken } = require('./middleware/auth');
app.get('/api/protected', authenticateToken, controller);
```

### optionalAuth
Same as above but doesn't fail if token missing:
```javascript
const { optionalAuth } = require('./middleware/auth');
app.get('/api/public', optionalAuth, controller);
```

### requireRole
Checks user has specific role:
```javascript
const { requireRole, ROLES } = require('./middleware/roleCheck');
app.post('/api/ngo', requireRole(ROLES.NGO_ADMIN), controller);
app.get('/api/data', requireRole([ROLES.MENTOR, ROLES.VOLUNTEER]), controller);
```

## Environment Variables

See `.env.example` for complete list:
- MongoDB URI
- Firebase credentials (ID, key, email, database URL)
- Google Calendar API keys
- OpenAI API key
- SMTP email settings
- JWT configuration
- CORS origins
- Rate limiting settings

## Production Deployment

1. Use environment variables for all secrets
2. Set NODE_ENV=production
3. Use managed MongoDB (Atlas, Azure, etc.)
4. Enable HTTPS
5. Set up monitoring and error tracking
6. Configure automated backups
7. Use Docker for containerization

## Testing

Run the test suite:
```bash
npm test
npm run test:watch
```

## Code Quality

Run linter:
```bash
npm run lint
```

## Support

All models are fully documented with:
- JSDoc comments
- Method descriptions
- Index optimization notes
- Relationship documentation

Refer to individual model files for specific method documentation.
