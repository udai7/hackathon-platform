import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform';

// Connection options with reasonable timeouts
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000, // 10 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  heartbeatFrequencyMS: 5000, // 5 seconds
};

// Connection function with better error reporting
export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Determine error type for better user feedback
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n⚠️ MongoDB server not running or not accessible ⚠️');
      } else if (error.message.includes('MongoServerSelectionError')) {
        console.error('\n⚠️ Cannot connect to MongoDB server ⚠️');
      } else if (error.message.includes('Authentication failed')) {
        console.error('\n⚠️ MongoDB authentication failed - check username and password ⚠️');
      } else if (error.message.includes('not authorized')) {
        console.error('\n⚠️ MongoDB authorization failed - check database permissions ⚠️');
      }
    }
    
    // In development, provide helpful error message for common issues
    console.log('\n📋 Connection troubleshooting tips:');
    console.log('1. Make sure MongoDB is running on your local system or that your Atlas connection string is correct.');
    console.log('2. Check if your connection string is correct in the .env file.');
    console.log('3. If using MongoDB Atlas, ensure your IP address is whitelisted.');
    console.log('4. Verify that your username/password is correct if using authentication.');
    console.log('\n▶️ The application will continue with in-memory storage instead.\n');
    
    // Rethrow the error to be handled by the calling function
    throw error;
  }
};

// Disconnect function (useful for testing and graceful shutdown)
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}; 