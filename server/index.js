require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const supportRoutes = require('./routes/support');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-platform';

const connectDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
      break;
    } catch (err) {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      retries -= 1;
      console.log(`⚠️ Retrying in 5 seconds... (${retries} attempts left)`);
      if (retries === 0) {
        console.error('❌ Failed to connect to MongoDB after multiple attempts.');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

connectDB();

