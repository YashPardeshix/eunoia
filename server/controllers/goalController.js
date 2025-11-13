const asyncHandler = require("../middleware/asyncHandler");
const GoalPlan = require("../models/GoalPlan");
const LearningModule = require("../models/LearningModule");
const Resource = require("../models/Resource");
const { generateRoadmapFromGemini } = require("../services/geminiService");

const createGoal = asyncHandler(async (req, res) => {
  try {
    const { goalTitle, userLevel = "BEGINNER" } = req.body;

    if (!goalTitle || !goalTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal title is required",
      });
    }

    let aiData;
    try {
      aiData = await generateRoadmapFromGemini(goalTitle.trim(), userLevel);
    } catch (aiErr) {
      console.error(
        "Gemini failed:",
        aiErr && aiErr.message ? aiErr.message : aiErr
      );
      return res.status(502).json({
        success: false,
        message:
          "AI failed to generate a roadmap (provider overloaded or returned invalid data). Please try again shortly.",
      });
    }

    const modulesFromAI = Array.isArray(aiData?.modules) ? aiData.modules : [];

    if (modulesFromAI.length === 0) {
      return res.status(502).json({
        success: false,
        message: "AI did not return any modules",
      });
    }

    const goal = await GoalPlan.create({
      goalTitle: goalTitle.trim(),
      userLevel,
      progressStatus: "IN_PROGRESS",
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
      populate: { path: "resourceIds", model: "Resource" },
    });

    return res.status(201).json({
      success: true,
      data: populatedGoal,
    });
  } catch (err) {
    console.error(
      "Goal creation failed:",
      err && err.message ? err.message : err
    );
    return res.status(500).json({
      success: false,
      message: "Server error while creating goal. Please try again.",
    });
  }
});

const getGoalById = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  if (!goalId) {
    return res
      .status(400)
      .json({ success: false, message: "goalId is required" });
  }

  try {
    const goal = await GoalPlan.findById(goalId).populate({
      path: "moduleIds",
      model: "LearningModule",
      options: { sort: { order: 1 } },
      populate: { path: "resourceIds", model: "Resource" },
    });

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    }

    return res.status(200).json({ success: true, data: goal });
  } catch (err) {
    console.error(
      "getGoalById failed:",
      err && err.message ? err.message : err
    );
    return res.status(500).json({
      success: false,
      message: "Server error while fetching goal",
    });
  }
});

module.exports = {
  createGoal,
  getGoalById,
};
