const asyncHandler = require("../middleware/asyncHandler");
const LearningModule = require("../models/LearningModule");
const GoalPlan = require("../models/GoalPlan");
const Resource = require("../models/Resource");
const {
  updateGoalProgress,
  generateSuggestion,
} = require("../services/progressService");

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

  if (!isCompleted) {
    return res.status(200).json({
      success: true,
      message: "Module updated",
      data: {
        module: updatedModule,
        progress: { percent, status },
        suggestion: null,
      },
    });
  }

  const suggestion = await generateSuggestion(moduleId);

  if (!suggestion) {
    return res.status(200).json({
      success: true,
      message: "Module completed. No suggestion generated.",
      data: {
        module: updatedModule,
        progress: { percent, status },
        suggestion: null,
      },
    });
  }

  const completedOrder = updatedModule.order;

  await LearningModule.updateMany(
    {
      goalPlanId: updatedModule.goalPlanId,
      order: { $gt: completedOrder },
    },
    { $inc: { order: 1 } }
  );

  const newModule = await LearningModule.create({
    goalPlanId: updatedModule.goalPlanId,
    title: suggestion.title,
    description: suggestion.description,
    order: completedOrder + 1,
    resourceIds: [],
    isCompleted: false,
  });

  if (Array.isArray(suggestion.resources) && suggestion.resources.length > 0) {
    const resourceDocs = await Resource.insertMany(
      suggestion.resources.map((r) => ({
        moduleId: newModule._id,
        title: r.title,
        url: r.url,
        sourceType: r.sourceType,
        description: r.description,
      }))
    );

    newModule.resourceIds = resourceDocs.map((r) => r._id);
    await newModule.save();
  }

  await GoalPlan.findByIdAndUpdate(updatedModule.goalPlanId, {
    $push: { moduleIds: newModule._id },
  });

  return res.status(200).json({
    success: true,
    message: "Module completed. Adaptive suggestion added.",
    data: {
      module: updatedModule,
      progress: { percent, status },
      suggestion: newModule,
    },
  });
});

module.exports = { updateModule };
