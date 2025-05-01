import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get messages for a conversation
router.get('/:conversationId', getMessages);

// Send a new message
router.post('/', sendMessage);

// Mark message as read
router.post('/:messageId/read', markMessageAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

export default router;
