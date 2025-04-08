import mongoose from "mongoose"

const disputeSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.ObjectId,
      ref: "Item",
      required: true,
    },
    requester: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    finder: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Please provide a reason for the dispute"],
      maxlength: [500, "Reason cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "escalated", "resolved", "closed"],
      default: "open",
    },
    resolution: {
      type: String,
      maxlength: [1000, "Resolution cannot be more than 1000 characters"],
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    timeline: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
        },
      },
    ],
    documents: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Add index for faster queries
disputeSchema.index({ status: 1, priority: -1 })
disputeSchema.index({ item: 1 })
disputeSchema.index({ requester: 1 })
disputeSchema.index({ finder: 1 })

const Dispute = mongoose.model("Dispute", disputeSchema)

export default Dispute

