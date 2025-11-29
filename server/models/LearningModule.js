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

    isAdaptive: {
      type: Boolean,
      default: false,
    },

    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "INTERMEDIATE",
    },

    estimatedHours: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LearningModule", LearningModuleSchema);
