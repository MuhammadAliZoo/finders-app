import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    ],
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true
    },
    dispute: {
      type: mongoose.Schema.ObjectId,
      ref: "Dispute",
    },
    type: {
      type: String,
      enum: ["direct", "group", "admin", "dispute"],
      default: "direct",
    },
    title: {
      type: String,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true,
  },
)

// Add index for faster queries
conversationSchema.index({ participants: 1, updatedAt: -1 })
conversationSchema.index({ item: 1 })
conversationSchema.index({ dispute: 1 })

const Conversation = mongoose.model("Conversation", conversationSchema)

export default Conversation

