const asyncHandler = require("../middleware/asyncHandler");
const GoalPlan = require("../models/GoalPlan");

const createGoal = asyncHandler(async (req, res) => {
  const { goalTitle, userLevel } = req.body;

  if (!goalTitle) {
    throw new Error("Goal title is required");
  }

  const goal = await GoalPlan.create({
    goalTitle,
    userLevel,
    moduleIds: ["60d5ec49f1a2c30015b67a21"],
    progressStatus: "IN_PROGRESS",
  });
  res.status(201).json({ success: true, data: goal });
});

module.exports = { createGoal };
