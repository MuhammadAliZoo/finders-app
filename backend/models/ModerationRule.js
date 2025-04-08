import mongoose from "mongoose"

const moderationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a rule name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a rule description"],
    },
    criteria: {
      type: Object,
      required: [true, "Please provide rule criteria"],
    },
    action: {
      type: String,
      enum: ["flag", "reject", "approve", "notify"],
      required: [true, "Please provide an action"],
    },
    priority: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

const ModerationRule = mongoose.model("ModerationRule", moderationRuleSchema)

export default ModerationRule

