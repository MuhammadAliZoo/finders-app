import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  matchItems,
  moderateItem,
} from '../controllers/items.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getItems).post(protect, createItem);
router.route('/:id').get(getItemById).put(protect, updateItem).delete(protect, deleteItem);
router.route('/match').post(protect, requireAdmin, matchItems);
router.route('/:id/moderate').put(protect, requireAdmin, moderateItem);

export default router;
