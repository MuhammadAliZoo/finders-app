const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FoundItem = require('../models/FoundItem');

// Create a new found item
router.post('/', auth, async (req, res) => {
  try {
    const foundItem = new FoundItem({
      ...req.body,
      finder: req.user._id,
    });
    await foundItem.save();
    res.status(201).json(foundItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all found items (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { category, isRareItem, sort = 'createdAt' } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isRareItem) filter.isRareItem = isRareItem === 'true';

    const sortOptions = {
      createdAt: { createdAt: -1 },
      trending: { searchCount: -1 },
    };

    const items = await FoundItem.find(filter)
      .sort(sortOptions[sort] || sortOptions.createdAt)
      .populate('finder', 'name email')
      .limit(50);

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending items
router.get('/trending', async (req, res) => {
  try {
    const trendingItems = await FoundItem.find({ searchCount: { $gt: 0 } })
      .sort({ searchCount: -1 })
      .limit(10)
      .populate('finder', 'name email');
    res.json(trendingItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment search count for an item
router.post('/:id/search', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { searchCount: 1 } },
      { new: true },
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific found item
router.get('/:id', async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id).populate('finder', 'name email');
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
