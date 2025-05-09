import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemPerformance from '../models/SystemPerformance.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedData = [
  {
    totalRequests: 1500,
    averageResponseTime: 250, // in milliseconds
    createdAt: new Date('2024-03-01'),
  },
  {
    totalRequests: 2000,
    averageResponseTime: 200,
    createdAt: new Date('2024-03-10'),
  },
  {
    totalRequests: 2500,
    averageResponseTime: 180,
    createdAt: new Date('2024-03-20'),
  },
];

const seedSystemPerformance = async () => {
  try {
    // Clear existing data
    await SystemPerformance.deleteMany({});
    
    // Insert new data
    await SystemPerformance.insertMany(seedData);
    
    console.log('System performance data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding system performance data:', error);
    process.exit(1);
  }
};

seedSystemPerformance(); 