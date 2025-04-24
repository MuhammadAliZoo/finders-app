import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { login, register, getProfile, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router; 