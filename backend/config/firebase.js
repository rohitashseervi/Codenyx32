const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

let serviceAccount;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Try to load from environment variables first
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        database_url: process.env.FIREBASE_DATABASE_URL,
      };
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_FILE) {
      // Load from file if env variables not set
      const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_FILE);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Firebase service account file not found at ${filePath}`);
      }
      serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      throw new Error(
        'Firebase credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL or FIREBASE_SERVICE_ACCOUNT_FILE'
      );
    }

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      logger.info('Firebase Admin SDK initialized successfully');
    }

    return admin;
  } catch (error) {
    logger.error('Firebase initialization error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

// Verify Firebase token
const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.error('Token verification error:', error.message);
    throw error;
  }
};

// Create custom token for user
const createCustomToken = async (uid) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    return customToken;
  } catch (error) {
    logger.error('Custom token creation error:', error.message);
    throw error;
  }
};

// Get user by UID
const getUserByUID = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    return user;
  } catch (error) {
    logger.error('Get user error:', error.message);
    throw error;
  }
};

// Create Firebase user
const createUser = async (email, password, displayName) => {
  try {
    const user = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    return user;
  } catch (error) {
    logger.error('Create user error:', error.message);
    throw error;
  }
};

// Delete Firebase user
const deleteUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    logger.info(`User ${uid} deleted from Firebase`);
  } catch (error) {
    logger.error('Delete user error:', error.message);
    throw error;
  }
};

// Set custom claims for user
const setCustomClaims = async (uid, customClaims) => {
  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
  } catch (error) {
    logger.error('Set custom claims error:', error.message);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email) => {
  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    return resetLink;
  } catch (error) {
    logger.error('Password reset error:', error.message);
    throw error;
  }
};

module.exports = {
  admin,
  initializeFirebase,
  verifyToken,
  createCustomToken,
  getUserByUID,
  createUser,
  deleteUser,
  setCustomClaims,
  sendPasswordResetEmail,
};
