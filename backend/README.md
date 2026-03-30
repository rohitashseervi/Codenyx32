# GapZero Backend

Backend server for GapZero - An education platform for underserved children.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **APIs**: Google Calendar, OpenAI
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
gapzero/backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── firebase.js        # Firebase Admin SDK initialization
├── middleware/
│   ├── auth.js            # Firebase token verification
│   └── roleCheck.js       # Role-based access control
├── models/
│   ├── User.js            # Base user model
│   ├── NGO.js             # NGO organization
│   ├── Student.js         # Student profile
│   ├── Volunteer.js       # Volunteer profile
│   ├── Mentor.js          # Mentor profile
│   ├── Match.js           # Mentor-student matching
│   ├── ClassGroup.js      # Class groups
│   ├── LearningModule.js  # Course modules
│   ├── Session.js         # Teaching sessions
│   ├── Assessment.js      # Tests and quizzes
│   ├── TestResult.js      # Student test results
│   ├── Badge.js           # Achievement badges
│   ├── StudentBadge.js    # Student badge assignments
│   └── LearningPath.js    # Personalized learning paths
├── utils/
│   └── logger.js          # Logging utility
├── .env.example           # Environment variables template
├── package.json           # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## Installation

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- Firebase Admin credentials

### Setup Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd gapzero/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure:
- MongoDB connection string
- Firebase credentials
- Google Calendar API keys
- SMTP email settings
- OpenAI API key
- JWT secret

4. **Set up Firebase credentials**

Option A: Set individual environment variables:
```bash
export FIREBASE_PROJECT_ID=your-project-id
export FIREBASE_PRIVATE_KEY="your-private-key"
export FIREBASE_CLIENT_EMAIL=your-email
```

Option B: Place `firebase-service-account.json` in `config/` directory:
```bash
cp your-service-account.json config/firebase-service-account.json
```

5. **Start MongoDB**

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use local MongoDB
mongod
```

6. **Start the server**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Available Scripts

```bash
# Start server
npm start

# Development mode (with nodemon)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Seed database with sample data
npm run seed
```

## API Endpoints

### Health Check

```
GET /api/health
```

## Mongoose Models

All models include:
- Timestamps (createdAt, updatedAt)
- Proper indexing for performance
- Virtual fields for computed properties
- Instance methods for business logic
- Static methods for queries
- Validation rules

### User Model
- Firebase UID authentication
- Email verification
- Role-based system (ngo_admin, volunteer, mentor, student)
- Login attempt tracking
- Account locking mechanism

### NGO Model
- Organization details
- Service coverage (grades, subjects, languages)
- Admin assignment
- Statistics tracking
- Approval workflow

### Student Model
- Academic baseline scores
- Mentor assignment tracking
- Consistency tracking
- Badge management
- Progress monitoring

### Volunteer Model
- Subject expertise
- Grade band specialization
- Time slot management
- Background check tracking
- Performance metrics

### Mentor Model
- Expert subjects (max 2)
- Behavioral profile
- Student capacity management
- Match history
- Feedback collection

### Match Model
- Mentor-student pairing
- Quality scoring
- Progress tracking
- Session management
- Intervention flags

### ClassGroup Model
- Class information
- Schedule management
- Enrollment tracking
- Curriculum mapping
- Performance data

### LearningModule Model
- Subject-specific content
- Teaching guides
- Activities and resources
- Assessment strategies
- Prerequisite tracking

### Session Model
- Class and mentorship sessions
- Attendance tracking
- Feedback collection
- Notes and observations
- Issue tracking

### Assessment Model
- Question generation (AI-ready)
- Multiple question types
- Time limits and retakes
- Student performance tracking
- Statistics collection

### TestResult Model
- Student answers and scoring
- Mastery level determination
- Performance trends
- Feedback generation
- Review tracking

### Badge and StudentBadge Models
- Achievement badges
- Earning criteria
- Rarity tiers
- Performance-based awards

### LearningPath Model
- Personalized course paths
- Module sequencing
- Progress tracking
- Adaptation history
- Pacing analysis

## Authentication

All protected routes require Firebase ID token in Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

The `authenticateToken` middleware:
1. Verifies token with Firebase
2. Finds user in database
3. Attaches user info to request

## Role-Based Access Control

Middleware for role checking:

```javascript
const { requireRole, ROLES } = require('./middleware/roleCheck');

// Single role
app.post('/api/ngo', requireRole(ROLES.NGO_ADMIN), controller);

// Multiple roles
app.get('/api/sessions', requireRole([ROLES.VOLUNTEER, ROLES.MENTOR]), controller);
```

Available roles:
- `ngo_admin`: NGO administrator
- `volunteer`: Class group teacher
- `mentor`: One-on-one mentor
- `student`: Student learner

## Database Indexing

All models include strategic indexes for:
- Frequently queried fields
- Sorting operations
- NGO-scoped queries
- Time-based queries
- Compound queries for uniqueness

## Error Handling

Centralized error handling:
- Request ID tracking
- Structured logging
- Appropriate HTTP status codes
- User-friendly error messages

## Logging

Logs are written to:
- Console (development)
- `logs/error.log` (errors only)
- `logs/warn.log` (warnings only)
- `logs/combined.log` (all logs)

Log levels: error, warn, info, debug

## Security Features

- Helmet.js for HTTP headers
- CORS protection
- Rate limiting
- Firebase token verification
- Input validation
- SQL injection prevention (via Mongoose)
- XSS protection

## Environment Variables

See `.env.example` for all required variables:

- `NODE_ENV`: Development, production, or test
- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Firebase client email
- `GOOGLE_CALENDAR_API_KEY`: Google Calendar API key
- `OPENAI_API_KEY`: OpenAI API key
- `SMTP_*`: Email configuration
- `JWT_SECRET`: JWT secret for custom tokens
- `CORS_ORIGIN`: Allowed CORS origins

## Testing

```bash
npm test
```

Tests are configured with Jest. Test files should be named `*.test.js` or `*.spec.js`.

## Deployment

### Prerequisites
- Docker (for containerization)
- MongoDB Atlas or managed MongoDB service
- Firebase project with Admin SDK credentials

### Docker Build

```bash
docker build -t gapzero-backend .
docker run -p 5000:5000 --env-file .env gapzero-backend
```

### Environment for Production

1. Use environment variables for all credentials
2. Set `NODE_ENV=production`
3. Enable HTTPS
4. Use managed MongoDB (Atlas, Azure Cosmos, etc.)
5. Set up proper error monitoring
6. Enable database backups

## API Documentation

API documentation can be generated using:
- Swagger/OpenAPI specification
- Postman collection
- JSDoc comments

## Contributing

1. Create a feature branch
2. Follow the existing code style
3. Write tests for new features
4. Update documentation
5. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue in the repository.
