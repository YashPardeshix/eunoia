const asyncHandler = require("../middleware/asyncHandler");
const GoalPlan = require("../models/GoalPlan");
const LearningModule = require("../models/LearningModule");
const Resource = require("../models/Resource");

const { generateFullRoadmap } = require("../services/geminiService");
const { searchSerpForTopic } = require("../services/serpService");
const { searchYouTubePlayable } = require("../services/youtubeService");
const { mergeAndClassify } = require("../services/resourceClassifier");

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
      console.error("Gemini error:", err);
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
      goalTitle: goalTitle.trim(),
      userLevel,
      progressStatus: "IN_PROGRESS",
      moduleIds: [],
    });

    const createdModuleIds = [];

    for (const mod of modulesFromAI) {
      const aiResources = Array.isArray(mod.resources)
        ? mod.resources.map((r) => ({
            title: r.title || "",
            url: r.url || "",
            sourceType: (r.sourceType || "").toUpperCase(),
            description: r.description || "",
          }))
        : [];

      let serpResults = [];
      try {
        const q = `${goalTitle} ${mod.title || ""}`.trim();
        if (q) serpResults = await searchSerpForTopic(q);
      } catch {
        serpResults = [];
      }

      let youtubeResults = [];
      try {
        youtubeResults = await searchYouTubePlayable(
          `${goalTitle} ${mod.title}`,
          5
        );
      } catch {
        youtubeResults = [];
      }

      const mergedResources = mergeAndClassify(
        aiResources,
        serpResults,
        youtubeResults
      );

      // Create module
      const moduleDoc = await LearningModule.create({
        goalPlanId: goal._id,
        title: mod.title || "Untitled Module",
        description: mod.description || "",
        order: typeof mod.order === "number" ? mod.order : 0,
        resourceIds: [],
        isCompleted: false,
      });

      if (mergedResources.length > 0) {
        const resourceDocs = mergedResources.map((r) => ({
          moduleId: moduleDoc._id,
          title: r.title || r.url || "Resource",
          url: r.url || "#",
          sourceType: (r.type || "OTHER").toUpperCase(),
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

module.exports = { createGoal, getGoalById };
