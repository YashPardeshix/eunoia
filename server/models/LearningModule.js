const mongoose = require("mongoose");

const LearningModuleSchema = new mongoose.Schema(
  {
    goalPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoalPlan",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    order: Number,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    resourceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
  },
  { timestamps: true }
);

const LearningModule = mongoose.model("LearningModule", LearningModuleSchema);
module.exports = LearningModule;
