// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI === 'null') {
    throw new Error(
      'MONGODB_URI is not configured. Set it in the backend .env file.'
    );
  }

  await mongoose.connect(mongoURI);

  console.log('MongoDB connected successfully');
};

module.exports = connectDB;
