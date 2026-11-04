const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables (supports running from root or server dir)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS: the mobile app authenticates with a Bearer header (no cookies), so credentials are
// not needed. CLIENT_URL may be "*" (default, dev) or a comma-separated list of web origins.
const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Request Logger
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    service: 'EcoPulse API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatusMap[mongoose.connection.readyState] || 'unknown',
  });
});

// Mount Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/footprint', require('./routes/footprintRoutes'));
app.use('/api/v1/activities', require('./routes/activityRoutes'));
app.use('/api/v1/points', require('./routes/pointsRoutes'));
app.use('/api/v1/solar', require('./routes/solarRoutes'));
app.use('/api/v1/vendors', require('./routes/vendorRoutes'));
app.use('/api/v1/community', require('./routes/communityRoutes'));

// Unknown API routes -> JSON 404 instead of an HTML page
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

let server;
if (require.main === module) {
  // Connect to Database, then make sure the activity catalogue exists (idempotent upsert)
  connectDB().then(async () => {
    if (mongoose.connection.readyState === 1 && process.env.AUTO_SEED_ACTIVITIES !== 'false') {
      try {
        await require('./scripts/seedActivities').seedActivities();
      } catch (err) {
        console.error(`❌ Activity catalogue sync failed: ${err.message}`);
      }
      try {
        await require('./scripts/seedCommunity').seedCommunityPosts();
      } catch (err) {
        console.error(`❌ Community posts seed failed: ${err.message}`);
      }
    }
  });

  server = app.listen(PORT, HOST, () => {
    console.log(
      `🚀 EcoPulse Server running in ${process.env.NODE_ENV || 'development'} mode on ${HOST}:${PORT}`
    );
    console.log(`📡 Local Health Check: http://localhost:${PORT}/api/v1/health`);
    try {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`📱 LAN Health Check:   http://${net.address}:${PORT}/api/v1/health  (${name})`);
          }
        }
      }
    } catch {
      // Ignore network interface discovery errors
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the other process or change PORT in server/.env.`);
      process.exit(1);
    }
    throw err;
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err && err.message}`);
});

module.exports = app;
