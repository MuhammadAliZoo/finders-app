import mongoose from "mongoose"

const adminMetricsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    newUsers: {
      type: Number,
      default: 0,
    },
    newItems: {
      type: Number,
      default: 0,
    },
    matches: {
      type: Number,
      default: 0,
    },
    disputes: {
      type: Number,
      default: 0,
    },
    resolvedDisputes: {
      type: Number,
      default: 0,
    },
    moderatedItems: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: Number,
      default: 0,
    },
    geographicData: [
      {
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
          address: String,
        },
        count: {
          type: Number,
          default: 0,
        },
        itemType: {
          type: String,
          enum: ["lost", "found"],
        },
      },
    ],
    categoryData: [
      {
        category: String,
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Add index for faster queries
adminMetricsSchema.index({ date: 1 })

const AdminMetrics = mongoose.model("AdminMetrics", adminMetricsSchema)

export default AdminMetrics

