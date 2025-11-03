const mongoose = require("mongoose");

const GoalPlanSchema = new mongoose.Schema(
  {
    goalTitle: {
      type: String,
      required: true,
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
    moduleIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

const GoalPlan = mongoose.model("GoalPlan", GoalPlanSchema);
module.exports = GoalPlan;
