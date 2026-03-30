# GapZero Backend API Documentation

Complete API documentation for the GapZero education platform backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Services

### 1. Matching Algorithm Service
**File:** `services/matchingAlgorithm.js`

#### Functions:
- `calculateMatchScore(mentor, student)` - Calculate match score (0-100) based on:
  - Subject alignment (30%)
  - Learning gap priority (25%)
  - Language match (20%)
  - Availability (15%)
  - Behavioral fit (10%)

- `findMentorMatches(studentId, ngoId)` - Find available mentors ranked by match score
- `executeMatch(studentId, mentorId, ngoId)` - Create match and update counters
- `endMatch(studentId, mentorId)` - End a match

### 2. Learning Path Generator Service
**File:** `services/learningPathGenerator.js`

#### Functions:
- `generateLearningPath(volunteerId, classGroupId, subject, grade, commitmentDuration, timeSlots)` - Create learning path
- `getLearningPath(learningPathId)` - Fetch learning path
- `completeModule(learningPathId, moduleId)` - Mark module as complete
- `getVolunteerLearningPaths(volunteerId)` - Get all active paths for volunteer

### 3. Gmail Service
**File:** `services/gmailService.js`

#### Functions:
- `sendClassInvite(studentEmails, meetLink, topic, date, volunteerName)`
- `sendTestNotification(studentEmails, testId, topic, deadline)`
- `sendMentorAlert(mentorEmail, studentName, testScore, topic)`
- `sendMentorAssignment(mentorEmail, studentName, matchScore)`
- `sendGenericNotification(email, subject, htmlBody)`

### 4. Google Meet Service
**File:** `services/meetService.js`

#### Functions:
- `createMeetSession(topic, dateTime, duration, attendeeEmails)` - Create Google Meet event
- `cancelMeetSession(eventId)` - Cancel Meet session
- `getMeetSessionDetails(eventId)` - Get session details
- `updateMeetSession(eventId, updates)` - Update session

### 5. AI Test Generator Service
**File:** `services/aiTestGenerator.js`

#### Functions:
- `generateTest(topic, subject, grade, difficulty='medium', numQuestions=20)` - Generate MCQ test using OpenAI
- `createAssessment(topic, subject, grade, difficulty, numQuestions, volunteerId, classGroupId)` - Create and save assessment
- Fallback to pre-built question bank if OpenAI fails

### 6. Badge Service
**File:** `services/badgeService.js`

#### Badges:
- Perfect Score (100% on test)
- Math/English/Science Star (90%+ on 3 consecutive tests)
- 7-Day Streak / 30-Day Streak
- First Test
- Top Performer (top 3 in class)

#### Functions:
- `checkAndAwardBadges(studentId, assessmentContext)` - Check and award badges
- `getAllBadges()` - Get all badge definitions
- `getStudentBadges(studentId)` - Get student's badges

## API Routes

### Authentication Routes (`/api/auth`)

#### POST /register
Register new user
```json
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "student|volunteer|mentor|ngo_admin",
  "profileData": {...}
}
```

#### POST /login
Verify Firebase token
```json
{
  "token": "firebase-id-token"
}
```

#### GET /me
Get current user profile (Protected)

#### PUT /profile
Update profile (Protected)

---

### NGO Routes (`/api/ngo`)

#### POST / (ngo_admin)
Create NGO
```json
{
  "name": "NGO Name",
  "description": "Description",
  "location": "City",
  "contactEmail": "email@ngo.com",
  "contactPhone": "1234567890"
}
```

#### GET /
List all NGOs (Public)

#### GET /:id
Get NGO details

#### PUT /:id (ngo_admin)
Update NGO

#### POST /:id/students (ngo_admin)
Enroll single student
```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "grade": "10",
  "weakAreas": ["Math", "Science"],
  "baseline": {...}
}
```

#### POST /:id/students/bulk (ngo_admin)
Bulk enroll students
```json
{
  "students": [{...}, {...}]
}
```

#### GET /:id/students (ngo_admin)
List all students

#### GET /:id/volunteers (ngo_admin)
List volunteers

#### GET /:id/mentors (ngo_admin)
List mentors

#### PUT /:id/approve/:userId (ngo_admin)
Approve volunteer/mentor

#### PUT /:id/reject/:userId (ngo_admin)
Reject volunteer/mentor

---

### Volunteer Routes (`/api/volunteer`)

#### POST /register (Protected)
Register as volunteer
```json
{
  "subjects": ["Math", "English"],
  "gradeBand": ["9", "10"],
  "timeSlots": [{
    "dayOfWeek": "Monday",
    "startTime": "10:00",
    "endTime": "11:00",
    "duration": 60
  }],
  "duration": 3,
  "languages": ["English", "Hindi"],
  "qualifications": ["B.Tech", "Teaching Certificate"]
}
```

#### PUT /profile (Protected)
Update volunteer profile

#### GET /ngos (Protected)
Browse available NGOs

#### POST /join/:ngoId (Protected)
Request to join NGO

#### GET /learning-path (Protected)
Get assigned learning path

#### GET /sessions (Protected)
Get upcoming sessions

#### POST /sessions/:sessionId/start (Protected)
Start session and create Meet link

#### POST /sessions/:sessionId/complete (Protected)
Mark session as complete

#### POST /sessions/:sessionId/create-test (Protected)
Generate AI test for session
```json
{
  "difficulty": "medium",
  "numQuestions": 20
}
```

#### GET /students (Protected)
Get students in volunteer's classes

#### GET /test-results/:assessmentId (Protected)
Get test results

---

### Mentor Routes (`/api/mentor`)

#### POST /register (Protected)
Register as mentor
```json
{
  "expertSubjects": ["Math", "Physics"],
  "languagesSpoken": ["English", "Hindi"],
  "maxStudents": 5,
  "behavioralProfile": {
    "patience": 5,
    "communication": 4,
    "adaptability": 5
  },
  "yearsExperience": 5
}
```

#### PUT /profile (Protected)
Update mentor profile

#### GET /ngos (Protected)
Browse available NGOs

#### POST /join/:ngoId (Protected)
Request to join NGO

#### GET /students (Protected)
Get assigned students

#### GET /student/:studentId/progress (Protected)
Get student progress details

#### POST /student/:studentId/schedule-meet (Protected)
Schedule 1-on-1 Meet
```json
{
  "topic": "Linear Equations",
  "dateTime": "2024-03-15T14:00:00Z",
  "duration": 30
}
```

#### GET /alerts (Protected)
Get weak performance alerts

#### POST /student/:studentId/notes (Protected)
Add guidance notes
```json
{
  "content": "Student needs more practice on...",
  "category": "general|feedback|weak-area|strength|action-item"
}
```

---

### Student Routes (`/api/student`)

#### GET /profile (Protected)
Get student profile with progress

#### GET /classes (Protected)
Get upcoming classes

#### GET /mentor (Protected)
Get assigned mentor info

#### POST /request-mentor (Protected)
Request mentor assignment (triggers matching)

#### POST /change-mentor (Protected)
Request mentor change

#### GET /tests (Protected)
Get pending tests

#### GET /tests/:testId (Protected)
Get specific test to take

#### POST /tests/:testId/submit (Protected)
Submit test answers
```json
{
  "answers": ["A", "B", "C", "A", ...]
}
```

Response:
```json
{
  "score": 85,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "newBadges": [...]
}
```

#### GET /progress (Protected)
Get progress report (streaks, mastery, badges)

#### GET /badges (Protected)
Get earned badges

---

### Assessment Routes (`/api/test`)

#### GET /:testId
Get test (public with testId)

#### POST /:testId/submit (Protected)
Submit test answers

#### GET /:testId/results (Protected)
Get test results (volunteer/mentor/admin)

#### GET /:testId/scorecard (Protected)
Get detailed scorecard for student

---

### Dashboard Routes (`/api/dashboard`) - ngo_admin

#### GET /overview
KPI overview
```json
{
  "totalStudents": 150,
  "totalVolunteers": 20,
  "totalMentors": 15,
  "averageMastery": 72.5,
  "atRiskStudents": 18,
  "healthScore": "85%"
}
```

#### GET /students
Student performance list
Query params: `sortBy` (name|score-desc|score-asc), `filter` (all|at-risk|top-performers)

#### GET /volunteers
Volunteer effectiveness metrics

#### GET /mentors
Mentor load and student progress

#### GET /subjects
Subject-wise performance breakdown

#### GET /at-risk
At-risk students list

#### GET /test-results
Generalized test results (last 100)

#### GET /trends
Progress trends over time (weekly aggregation)

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Environment Variables

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
MONGODB_URI=mongodb://localhost:27017/gapzero
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/google-service-account.json
GMAIL_USER=noreply@gapzero.com
GMAIL_APP_PASSWORD=your-app-password
OPENAI_API_KEY=sk-your-key
PORT=5000
NODE_ENV=development
```

---

## Models

### User
- uid (string, unique)
- email (string, unique)
- displayName (string)
- role (enum: student, volunteer, mentor, ngo_admin)
- createdAt

### Student
- userId, email, name, grade
- ngoId, classGroupId, currentMentorId
- weakAreas, baseline
- assessmentHistory, matchHistory, activityLog
- badges, currentStreak
- learningNeed, enrolledAt

### Volunteer
- userId, email, name, ngoId
- subjects, gradeBand, timeSlots, duration
- languages, bio, qualifications
- learningPath, approved

### Mentor
- userId, email, name, ngoId
- expertSubjects, languagesSpoken
- maxStudents, currentStudentCount
- behavioralProfile, yearsExperience
- approved

### Assessment
- title, subject, topic, grade, difficulty
- questions (array with question, options, correctAnswer, explanation)
- createdBy, classGroupId, status
- submissions (array with studentId, answers, score, submittedAt)

### LearningPath
- volunteerId, classGroupId
- subject, grade, commitmentDuration
- timeSlots, startDate, endDate
- modules (array with moduleId, scheduledDate, status)
- totalModules, completedModules

### ClassSession
- classGroupId, volunteerId
- topic, subject, grade, scheduledDate, duration
- status (scheduled, in_progress, completed, cancelled)
- meetLink, meetEventId, assessmentId

### Match
- studentId, mentorId, ngoId
- matchScore, matchedAt, endedAt
- status (active, inactive)

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Run server:**
   ```bash
   npm run dev
   ```

5. **Verify health:**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## Notes

- All timestamps are in UTC ISO 8601 format
- Match scoring uses weighted algorithm for optimal mentor-student pairing
- Tests with 100% scores auto-award Perfect Score badge
- Activity streaks calculated from activityLog entries
- At-risk students have average test score < 60%
