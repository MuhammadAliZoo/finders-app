import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation
} from '../controllers/conversationController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new conversation
router.post('/', createConversation);

// Get all conversations for the current user
router.get('/', getConversations);

// Get a specific conversation
router.get('/:id', getConversation);

// Update a conversation
router.put('/:id', updateConversation);

// Delete a conversation
router.delete('/:id', deleteConversation);

export default router; 