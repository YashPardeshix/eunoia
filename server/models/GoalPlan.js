const mongoose = require("mongoose");

const GoalPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    goalTitle: {
      type: String,
      required: true,
      trim: true,
    },
    userLevel: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
    },
    progressStatus: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"],
      default: "NOT_STARTED",
    },
    moduleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LearningModule",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoalPlan", GoalPlanSchema);
