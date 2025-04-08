import mongoose from "mongoose"

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: ["electronics", "clothing", "accessories", "documents", "pets", "other"],
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      address: {
        type: String,
        required: [true, "Please provide an address"],
      },
    },
    date: {
      type: Date,
      required: [true, "Please provide a date"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "matched", "returned", "flagged"],
      default: "pending",
    },
    itemType: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Please specify if the item is lost or found"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    matchedWith: {
      type: mongoose.Schema.ObjectId,
      ref: "Item",
      default: null,
    },
    aiTags: [
      {
        type: String,
      },
    ],
    moderationNotes: {
      type: String,
    },
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Geospatial index
itemSchema.index({ location: "2dsphere" })

// Virtual populate disputes related to this item
itemSchema.virtual("disputes", {
  ref: "Dispute",
  localField: "_id",
  foreignField: "item",
  justOne: false,
})

const Item = mongoose.model("Item", itemSchema)

export default Item

