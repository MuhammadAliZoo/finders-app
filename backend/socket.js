import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:19006',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Update user status
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join personal room
    socket.join(socket.user._id.toString());

    // Handle joining conversation rooms
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user._id} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.user._id} left conversation: ${conversationId}`);
    });

    // Handle new messages
    socket.on('sendMessage', async ({ conversationId, message }) => {
      io.to(conversationId).emit('newMessage', message);
    });

    // Handle typing indicators
    socket.on('typing', ({ userId, conversationId }) => {
      socket.to(conversationId).emit('typing', userId);
    });

    socket.on('stopTyping', ({ userId, conversationId }) => {
      socket.to(conversationId).emit('stopTyping', userId);
    });

    // Handle message read status
    socket.on('messageRead', ({ messageId, userId }) => {
      io.emit('messageRead', messageId);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user._id}`);
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });

  return io;
}; 