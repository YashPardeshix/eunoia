const mongoose = require("mongoose");

const LearningModuleSchema = new mongoose.Schema(
  {
    goalPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "GoalPlan",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    resourcesIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

const LearningModule = mongoose.model("LearningModule", LearningModuleSchema);
module.exports = LearningModule;
