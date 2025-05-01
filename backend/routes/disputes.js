import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// Placeholder for dispute routes
router.get('/', (req, res) => {
  res.json({ message: 'Disputes API' });
});

export default router;
