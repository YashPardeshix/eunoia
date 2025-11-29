const asyncHandler = require("../middleware/asyncHandler");
const LearningModule = require("../models/LearningModule");
const { updateGoalProgress } = require("../services/progressService");

const updateModule = asyncHandler(async (req, res) => {
  const moduleId = req.params.id;
  const { isCompleted } = req.body;

  const updatedModule = await LearningModule.findByIdAndUpdate(
    moduleId,
    { isCompleted },
    { new: true, runValidators: true }
  );

  if (!updatedModule) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  const { percent, status } = await updateGoalProgress(
    updatedModule.goalPlanId
  );

  return res.status(200).json({
    success: true,
    message: "Module updated",
    data: {
      module: updatedModule,
      progress: { percent, status },
    },
  });
});

module.exports = { updateModule };
