const asyncHandler = require("../middleware/asyncHandler");
const GoalPlan = require("../models/GoalPlan");
const LearningModule = require("../models/LearningModule");
const Resource = require("../models/Resource");
const { generateCompletionSuggestions } = require("../services/geminiService");

const generateSuggestions = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  const goal = await GoalPlan.findById(goalId).populate({
    path: "moduleIds",
    model: "LearningModule",
    options: { sort: { order: 1 } },
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found",
    });
  }

  const originalModules = goal.moduleIds.filter((m) => !m.isAdaptive);
  const allComplete = originalModules.every((m) => m.isCompleted);

  if (!allComplete) {
    return res.status(400).json({
      success: false,
      message:
        "Roadmap not completed yet. Suggestions available only at 100 percent completion.",
    });
  }

  if (!originalModules.length) {
    return res.status(400).json({
      success: false,
      message: "No modules found for this goal.",
    });
  }

  const suggestions = await generateCompletionSuggestions(
    goal.goalTitle,
    originalModules
  );

  if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
    return res.status(502).json({
      success: false,
      message: "AI failed to generate suggestions. Try again.",
    });
  }

  return res.status(200).json({
    success: true,
    data: suggestions,
  });
});

const acceptSuggestion = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { suggestion } = req.body;

  if (!suggestion) {
    return res.status(400).json({
      success: false,
      message: "Suggestion data missing.",
    });
  }

  const goal = await GoalPlan.findById(goalId);

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found",
    });
  }

  const newModule = await LearningModule.create({
    goalPlanId: goalId,
    title: suggestion.title,
    description: suggestion.description,
    difficulty: suggestion.difficulty,
    estimatedHours: suggestion.estimatedHours,
    isAdaptive: true,
    isCompleted: false,
    order: goal.moduleIds.length + 1,
    resourceIds: [],
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

  await GoalPlan.findByIdAndUpdate(goalId, {
    $push: { moduleIds: newModule._id },
  });

  return res.status(201).json({
    success: true,
    data: newModule,
  });
});

module.exports = { generateSuggestions, acceptSuggestion };
