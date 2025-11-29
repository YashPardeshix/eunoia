const asyncHandler = require("../middleware/asyncHandler");
const GoalPlan = require("../models/GoalPlan");
const LearningModule = require("../models/LearningModule");
const Resource = require("../models/Resource");
const { generateFullRoadmap } = require("../services/geminiService");

const createGoal = asyncHandler(async (req, res) => {
  try {
    const { goalTitle, userLevel = "BEGINNER" } = req.body;

    if (!goalTitle?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal title is required",
      });
    }

    let aiData;
    try {
      aiData = await generateFullRoadmap(goalTitle.trim(), userLevel);
    } catch (err) {
      console.error("Gemini Service Error:", err);
      return res.status(502).json({
        success: false,
        message: "AI failed to generate a roadmap. Please try again shortly.",
      });
    }

    const modulesFromAI = Array.isArray(aiData?.modules) ? aiData.modules : [];
    if (!modulesFromAI.length) {
      return res.status(502).json({
        success: false,
        message: "AI returned no modules",
      });
    }

    const goal = await GoalPlan.create({
      user: req.user._id,
      goalTitle: goalTitle.trim(),
      userLevel,
      progressStatus: "IN_PROGRESS",
      moduleIds: [],
      originalCount: modulesFromAI.length,
    });

    const createdModuleIds = [];

    for (const mod of modulesFromAI) {
      const moduleDoc = await LearningModule.create({
        goalPlanId: goal._id,
        title: mod.title || "Untitled Module",
        description: mod.description || "",
        order: typeof mod.order === "number" ? mod.order : 0,
        estimatedHours: mod.estimatedHours || 2,
        resourceIds: [],
        isCompleted: false,
      });

      if (mod.resources && mod.resources.length > 0) {
        const resourceDocs = mod.resources.map((r) => ({
          moduleId: moduleDoc._id,
          title: r.title || "Resource",
          url: r.url || "#",
          sourceType: (r.sourceType || "OTHER").toUpperCase(),
          description: r.description || "",
        }));

        const inserted = await Resource.insertMany(resourceDocs);
        moduleDoc.resourceIds = inserted.map((x) => x._id);
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
    console.error("Create Goal Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating goal",
    });
  }
});

const getMyGoals = asyncHandler(async (req, res) => {
  try {
    const goals = await GoalPlan.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (err) {
    console.error("Get My Goals Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching your goals",
    });
  }
});

const getGoalById = asyncHandler(async (req, res) => {
  try {
    const { goalId } = req.params;

    if (!goalId) {
      return res.status(400).json({
        success: false,
        message: "Goal ID is required",
      });
    }

    const goal = await GoalPlan.findById(goalId).populate({
      path: "moduleIds",
      model: "LearningModule",
      options: { sort: { order: 1 } },
      populate: { path: "resourceIds", model: "Resource" },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to view this goal",
      });
    }

    return res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    console.error("Get Goal Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching goal",
    });
  }
});

module.exports = { createGoal, getGoalById, getMyGoals };
