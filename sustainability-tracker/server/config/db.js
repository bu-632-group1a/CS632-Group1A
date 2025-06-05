import mongoose from 'mongoose';

// MongoDB connection URI (use environment variable in production)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sustainability_tracker';

// Connect to MongoDB
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Mongoose connection options
    });
    
    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    
    // Set up global MongoDB configuration
    mongoose.set('debug', process.env.NODE_ENV !== 'production');
    
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Close MongoDB connection when Node process ends
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB disconnect:', err);
    process.exit(1);
  }
});