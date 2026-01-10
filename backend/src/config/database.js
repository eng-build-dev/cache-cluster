const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/live-polling';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectDatabase };




