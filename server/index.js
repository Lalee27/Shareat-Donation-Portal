require('dotenv').config();
const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignored if older node version
}
const cluster = require('cluster');
const os = require('os');

// In production, we run the server in a cluster to utilize all CPU cores.
// This allows handling 1000+ concurrent requests and prevents server crash issues.
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numCPUs = os.cpus().length;
  console.log(`👑 Master process ${process.pid} is running in production mode`);
  console.log(`Forking server into ${numCPUs} worker processes to maximize CPU utilization...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker process crashes, spawn a new one immediately for zero-downtime!
  cluster.on('exit', (worker, code, signal) => {
    console.error(`❌ Worker process ${worker.process.pid} died (code: ${code}, signal: ${signal}). Spawning a new worker...`);
    cluster.fork();
  });
} else {
  // Start the application inside the worker (or single process in development)
  startApp();
}

function startApp() {
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const helmet = require('helmet');
  const compression = require('compression');
  const rateLimit = require('express-rate-limit');

  const authRoutes = require('./routes/auth');
  const donationRoutes = require('./routes/donations');
  const adminRoutes = require('./routes/admin');
  const notificationRoutes = require('./routes/notifications');
  const supportRoutes = require('./routes/support');

  const app = express();

  // Trust reverse proxy headers (Nginx, Cloudflare, etc.) to get correct client IPs for rate-limiting
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Gzip Compression to minimize bandwidth usage and latency
  app.use(compression());

  // CORS Middleware — allowed origins based on environment
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.CLIENT_URL,               // e.g. https://donation-portal-client.onrender.com
        'https://donation-portal-client.onrender.com'
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }));
  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  // Rate Limiting Config
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 authentication/support attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many high-load or auth requests from this IP, please try again after 15 minutes.'
    }
  });

  // Apply rate limiters
  app.use('/api/', apiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/support', authLimiter);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/support', supportRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      pid: process.pid,
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Custom Global Error Handling Middleware (Catches Express v5 async errors and prevents server crash)
  app.use((err, req, res, next) => {
    console.error(`💥 Error in worker process ${process.pid}: ${err.stack || err.message}`);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;
      
    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  // MongoDB connection listeners for proactive health tracking
  mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose default connection error: ${err}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose default connection disconnected. Trying to reconnect...');
  });
  mongoose.connection.on('reconnected', () => {
    console.log('✅ Mongoose default connection reconnected successfully!');
  });

  // Connect to MongoDB and start server
  const PORT = process.env.PORT || 5000;
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-platform';

  // Start HTTP server FIRST so Render health check passes immediately
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (Worker process: ${process.pid})`);
  });

  const connectDB = async () => {
    let retries = 5;
    while (retries > 0) {
      try {
        await mongoose.connect(MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ Connected to MongoDB (Worker process: ${process.pid})`);
        break;
      } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        retries -= 1;
        if (retries === 0) {
          console.error('❌ Failed to connect to MongoDB after multiple attempts. Server will keep running but DB features will be unavailable.');
          return;
        }
        console.log(`⚠️ Retrying in 5 seconds... (${retries} attempts left)`);
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  };

  connectDB();


  // Graceful Shutdown Handler
  const gracefulShutdown = (signal) => {
    console.log(`⚠️ Received ${signal} on worker ${process.pid}. Starting graceful shutdown...`);
    if (server) {
      server.close(async () => {
        console.log(`HTTP server on worker ${process.pid} closed.`);
        try {
          await mongoose.connection.close(false);
          console.log(`MongoDB connection closed on worker ${process.pid}.`);
          process.exit(0);
        } catch (err) {
          console.error(`Error closing MongoDB connection on worker ${process.pid}:`, err);
          process.exit(1);
        }
      });

      // Force shutdown after 10s if graceful shutdown takes too long
      setTimeout(() => {
        console.error(`Could not close connections in time, forcefully shutting down worker ${process.pid}`);
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  // Process event listeners for stability
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`❌ Unhandled Promise Rejection at:`, promise, `reason:`, reason);
  });

  process.on('uncaughtException', (error) => {
    console.error(`❌ Uncaught Exception thrown:`, error);
    gracefulShutdown('uncaughtException');
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
