const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables (supports running from root or server dir)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

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

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `🚀 EcoPulse Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
    console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
});

module.exports = app;
