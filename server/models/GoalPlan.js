const mongoose = require("mongoose");

const GoalPlanSchema = new mongoose.Schema(
  {
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

const GoalPlan = mongoose.model("GoalPlan", GoalPlanSchema);
module.exports = GoalPlan;
