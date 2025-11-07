const asyncHandler = require("../middleware/asyncHandler");
const GoalPlan = require("../models/GoalPlan");
const LearningModule = require("../models/LearningModule");
const Resource = require("../models/Resource");
const { generateRoadmapFromGemini } = require("../services/gemini-service");

const createGoal = asyncHandler(async (req, res) => {
  const { goalTitle, userLevel = "BEGINNER" } = req.body;

  if (!goalTitle?.trim()) {
    return res.status(400).json({ message: "Goal title is required" });
  }

  const aiResponse = await generateRoadmapFromGemini(
    goalTitle.trim(),
    userLevel
  );
  const modulesFromAI = Array.isArray(aiResponse?.modules)
    ? aiResponse.modules
    : [];

  if (modulesFromAI.length === 0) {
    return res.status(502).json({ message: "AI did not return any modules" });
  }

  const goal = await GoalPlan.create({
    goalTitle: goalTitle.trim(),
    userLevel,
    progressStatus: "In Progress",
    moduleIds: [],
  });

  const createdModuleIds = [];

  for (const mod of modulesFromAI) {
    const moduleDoc = await LearningModule.create({
      goalPlanId: goal._id,
      title: mod.title,
      description: mod.description,
      order: mod.order,
      resourceIds: [],
      isCompleted: false,
    });

    const resources = Array.isArray(mod.resources) ? mod.resources : [];
    if (resources.length > 0) {
      const inserted = await Resource.insertMany(
        resources.map((r) => ({
          moduleId: moduleDoc._id,
          title: r.title,
          url: r.url,
          sourceType: r.sourceType,
          description: r.description ?? "",
        }))
      );
      moduleDoc.resourceIds = inserted.map((r) => r._id);
      await moduleDoc.save();
    }

    createdModuleIds.push(moduleDoc._id);
  }

  goal.moduleIds = createdModuleIds;
  await goal.save();

  const populatedGoal = await GoalPlan.findById(goal._id).populate({
    path: "moduleIds",
    model: "LearningModule",
    options: { sort: { order: 1 } },
    populate: {
      path: "resourceIds",
      model: "Resource",
    },
  });

  return res.status(201).json({
    success: true,
    data: populatedGoal,
  });
});

module.exports = { createGoal };
