const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  }],
  finder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'expired'],
    default: 'pending'
  },
  searchCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  isRareItem: {
    type: Boolean,
    default: false
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Extremely Rare'],
    required: function() { return this.isRareItem; }
  },
  condition: {
    type: String,
    enum: ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'],
    required: function() { return this.isRareItem; }
  },
  finderReward: {
    type: Number,
    required: function() { return this.isRareItem; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to validate image URLs
foundItemSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const invalidUrls = this.images.filter(url => !/^https?:\/\/.+/.test(url));
    if (invalidUrls.length > 0) {
      next(new Error(`Invalid image URLs: ${invalidUrls.join(', ')}`));
    }
  }
  next();
});

// Index for searching and sorting
foundItemSchema.index({ title: 'text', description: 'text', tags: 'text' });
foundItemSchema.index({ searchCount: -1 });
foundItemSchema.index({ createdAt: -1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

module.exports = FoundItem; 