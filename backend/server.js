import dotenv from 'dotenv';
// Load env vars
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import disputeRoutes from './routes/disputes.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import SystemPerformance from './models/SystemPerformance.js';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:19006',
      'http://localhost:19000',
      'http://localhost:19001',
      'http://localhost:19002',
      'exp://localhost:19000',
      'exp://localhost:19001',
      'exp://localhost:19002',
      'exp://192.168.1.2:19000',
      'exp://192.168.1.2:19001',
      'exp://192.168.1.2:19002',
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:19006',
      'exp://localhost:19000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io connection
io.on('connection', socket => {
  console.log('New client connected');

  // Join a room (e.g., for a specific conversation or admin dashboard)
  socket.on('join', room => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Leave a room
  socket.on('leave', room => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  // Send a message
  socket.on('message', data => {
    io.to(data.room).emit('message', data);
  });

  // Admin notifications
  socket.on('admin-notification', data => {
    io.to('admin').emit('admin-notification', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Server is listening on http://0.0.0.0:${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/admin/reports');
  console.log('- GET /api/items');
  console.log('- GET /api/disputes');
  console.log('- GET /api/users');
});
