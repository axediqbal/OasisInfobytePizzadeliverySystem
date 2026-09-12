const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slicehub';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error(`[MongoDB] Connection error: ${err.message}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;

