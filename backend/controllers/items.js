import Item from '../models/Item.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
export const createItem = asyncHandler(async (req, res) => {
  const { title, description, category, images, location, date, itemType } = req.body;

  const item = await Item.create({
    title,
    description,
    category,
    images,
    location,
    date,
    itemType,
    user: req.user.id,
    status: 'pending',
  });

  res.status(201).json(item);
});

// @desc    Get all items
// @route   GET /api/items
// @access  Private
export const getItems = asyncHandler(async (req, res) => {
  const {
    itemType,
    category,
    status,
    lat,
    lng,
    distance = 10000, // default 10km
    startDate,
    endDate,
    search,
  } = req.query;

  const query = {};

  // Filter by item type (lost or found)
  if (itemType) {
    query.itemType = itemType;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status
  if (status) {
    query.status = status;
  } else {
    // By default, only show approved items
    query.status = 'approved';
  }

  // Filter by date range
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }

  // Search by title or description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Geospatial query if coordinates provided
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
        },
        $maxDistance: Number.parseInt(distance),
      },
    };
  }

  const items = await Item.find(query)
    .populate('user', 'name email profileImage')
    .sort({ createdAt: -1 });

  res.json(items);
});

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('user', 'name email profileImage')
    .populate('matchedWith')
    .populate('moderatedBy', 'name');

  if (item) {
    res.json(item);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Check if user owns the item or is an admin
  if (item.user.toString() !== req.user.id && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email profileImage');

  res.json(updatedItem);
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Check if user owns the item or is an admin
  if (item.user.toString() !== req.user.id && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  await item.remove();

  res.json({ message: 'Item removed' });
});

// @desc    Match items
// @route   POST /api/items/match
// @access  Private (Admin only)
export const matchItems = asyncHandler(async (req, res) => {
  const { lostItemId, foundItemId } = req.body;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(lostItemId) ||
    !mongoose.Types.ObjectId.isValid(foundItemId)
  ) {
    res.status(400);
    throw new Error('Invalid item IDs');
  }

  const lostItem = await Item.findById(lostItemId);
  const foundItem = await Item.findById(foundItemId);

  if (!lostItem || !foundItem) {
    res.status(404);
    throw new Error('One or both items not found');
  }

  if (lostItem.itemType !== 'lost' || foundItem.itemType !== 'found') {
    res.status(400);
    throw new Error('Items must be of correct types (lost and found)');
  }

  // Update both items
  lostItem.status = 'matched';
  lostItem.matchedWith = foundItemId;
  await lostItem.save();

  foundItem.status = 'matched';
  foundItem.matchedWith = lostItemId;
  await foundItem.save();

  res.json({
    message: 'Items matched successfully',
    lostItem,
    foundItem,
  });
});

// @desc    Moderate an item (approve/reject)
// @route   PUT /api/items/:id/moderate
// @access  Private (Admin only)
export const moderateItem = asyncHandler(async (req, res) => {
  const { status, moderationNotes } = req.body;

  if (!['approved', 'rejected', 'flagged'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  item.status = status;
  item.moderationNotes = moderationNotes || '';
  item.moderatedBy = req.user.id;
  item.moderatedAt = Date.now();

  const updatedItem = await item.save();

  res.json(updatedItem);
});
