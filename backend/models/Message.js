import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'file']
        },
        url: String
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isSystemMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

const Message = mongoose.model("Message", messageSchema)

export default Message

