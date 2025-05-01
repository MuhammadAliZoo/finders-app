import express from 'express';
import {
  getDashboardData,
  getItemsForModeration,
  getModerationRules,
  createModerationRule,
  updateModerationRule,
  batchModerateItems,
  getDisputes,
  getDisputeById,
  updateDisputeStatus,
  getAIRecommendation,
  generateReport,
} from '../controllers/admin.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(admin);

// Dashboard routes
router.get('/dashboard', getDashboardData);

// Moderation routes
router.get('/moderation/items', getItemsForModeration);
router.get('/moderation/rules', getModerationRules);
router.post('/moderation/rules', createModerationRule);
router.put('/moderation/rules/:id', updateModerationRule);
router.post('/moderation/batch', batchModerateItems);

// Dispute routes
router.get('/disputes', getDisputes);
router.get('/disputes/:id', getDisputeById);
router.patch('/disputes/:id/status', updateDisputeStatus);
router.get('/disputes/:id/ai-recommendation', getAIRecommendation);

// Report routes
router.post('/reports', generateReport);

export default router;
