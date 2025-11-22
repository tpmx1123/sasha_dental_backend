const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
// CORS Configuration - Allow both development and production origins
const allowedOrigins = [
  'http://localhost:3002',
  'http://localhost:3000',
  'https://sashasmiles.com',
  'https://www.sashasmiles.com'
];

// Helper to normalize origins (remove trailing slashes)
const normalizeOrigin = (origin) => {
  if (!origin) return null;
  return origin.replace(/\/$/, '');
};

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = normalizeOrigin(origin);
    const normalizedAllowed = allowedOrigins.map(normalizeOrigin);
    
    // Check if origin is in allowed list
    if (normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      // In development, allow any localhost origin for flexibility
      callback(null, true);
    } else {
      // Reject origin
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n📋 To fix this issue:');
    console.error('   1. Start MongoDB locally: mongod');
    console.error('   2. OR use MongoDB Atlas: Update MONGODB_URI in .env');
    console.error('   3. See MONGODB_SETUP.md for detailed instructions\n');
    
    // In development, allow server to continue (but APIs won't work)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Server running without MongoDB (APIs will fail)');
      return;
    }
    // In production, exit on connection failure
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dental Backend API is running',
    version: '1.0.0'
  });
});

// Import routes
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const adminBlogRoutes = require('./src/routes/adminBlogRoutes');

// Mount routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin/blogs', adminBlogRoutes);

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;

