const LearningModule = require("../models/LearningModule");
const GoalPlan = require("../models/GoalPlan");

async function updateGoalProgress(goalPlanId) {
  const total = await LearningModule.countDocuments({ goalPlanId });
  const completed = await LearningModule.countDocuments({
    goalPlanId,
    isCompleted: true,
  });

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const status =
    percent === 0 ? "NOT_STARTED" : percent < 100 ? "IN_PROGRESS" : "COMPLETED";

  await GoalPlan.findByIdAndUpdate(goalPlanId, { progressStatus: status });

  return { percent, status };
}

module.exports = { updateGoalProgress };
