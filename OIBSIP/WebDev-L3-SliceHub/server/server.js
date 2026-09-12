const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('./config/db');
const { initLowStockJob } = require('./jobs/lowStockCheck');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const orderRoutes = require('./routes/order.routes');
const catalogRoutes = require('./routes/catalog.routes');

const app = express();

// Global Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware for resilient serverless & local execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(`[DB Middleware Error] ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MongoDB is running or valid MONGO_URI is set.',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'SliceHub API',
    timestamp: new Date().toISOString(),
    dbState: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catalog', catalogRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server and cron job when executed directly (not in tests or serverless)
if (require.main === module && !process.env.VERCEL) {
  initLowStockJob();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🍕 SliceHub API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🚀 Client Origin: ${clientUrl}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;


