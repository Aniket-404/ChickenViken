const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK for admin app
const adminProjectId = process.env.ADMIN_FIREBASE_PROJECT_ID;
const adminClientEmail = process.env.ADMIN_FIREBASE_CLIENT_EMAIL;
const adminPrivateKey = process.env.ADMIN_FIREBASE_PRIVATE_KEY;

// Initialize Firebase Admin SDK for user app
const userProjectId = process.env.USER_FIREBASE_PROJECT_ID;
const userClientEmail = process.env.USER_FIREBASE_CLIENT_EMAIL;
const userPrivateKey = process.env.USER_FIREBASE_PRIVATE_KEY;

// Initialize Admin App
if (adminProjectId && adminClientEmail && adminPrivateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: adminProjectId,
      clientEmail: adminClientEmail,
      privateKey: adminPrivateKey.replace(/\\n/g, '\n'),
    }),
  }, 'admin');
  console.log('Admin Firebase SDK initialized successfully');
} else {
  console.warn('Admin Firebase service account credentials not found in environment variables.');
}

// Initialize User App
if (userProjectId && userClientEmail && userPrivateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: userProjectId,
      clientEmail: userClientEmail,
      privateKey: userPrivateKey.replace(/\\n/g, '\n'),
    }),
  }, 'user');
  console.log('User Firebase SDK initialized successfully');
} else {
  console.warn('User Firebase service account credentials not found in environment variables.');
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('ChickenViken API is running!');
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
