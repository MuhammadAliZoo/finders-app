import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@finders.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@finders.com',
      password: 'Admin@123', // This will be hashed automatically by the User model
      isAdmin: true,
      isVerified: true
    });

    console.log('Admin user created successfully:');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`ID: ${adminUser._id}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser(); 