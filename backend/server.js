const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase Admin Initialization
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gapzero', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GapZero backend is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const ngoRoutes = require('./routes/ngo');
const volunteerRoutes = require('./routes/volunteer');
const mentorRoutes = require('./routes/mentor');
const studentRoutes = require('./routes/student');
const assessmentRoutes = require('./routes/assessment');
const dashboardRoutes = require('./routes/dashboard');
const communicationRoutes = require('./routes/communication');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/ngo_admin', ngoRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/test', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/communication', communicationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`GapZero Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
