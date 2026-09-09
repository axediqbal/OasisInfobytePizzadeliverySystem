const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/slicehub';
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Don't crash immediately in dev mode, log retry hint
    console.warn('[MongoDB] Please make sure MongoDB is running locally or provide a valid MONGO_URI in .env');
  }
};

module.exports = connectDB;
