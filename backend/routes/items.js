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
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getItems).post(protect, createItem);
router.route('/:id').get(getItemById).put(protect, updateItem).delete(protect, deleteItem);
router.route('/match').post(protect, admin, matchItems);
router.route('/:id/moderate').put(protect, admin, moderateItem);

export default router;
