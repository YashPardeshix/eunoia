const LearningModule = require("../models/LearningModule");
const GoalPlan = require("../models/GoalPlan");
const {
  generateAdaptiveSuggestion,
  generateFullRoadmap,
} = require("./geminiService");

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

async function generateSuggestion(completedModuleId) {
  if (!completedModuleId) return null;

  const completedModule = await LearningModule.findById(
    completedModuleId
  ).populate({
    path: "goalPlanId",
    model: "GoalPlan",
    populate: {
      path: "moduleIds",
      model: "LearningModule",
      select: "title isCompleted order",
    },
  });

  if (!completedModule || !completedModule.goalPlanId) return null;

  const goalPlan = completedModule.goalPlanId;
  const modules = Array.isArray(goalPlan.moduleIds) ? goalPlan.moduleIds : [];

  const completedTitles = modules
    .filter((m) => m.isCompleted)
    .map((m) => m.title);

  const remainingTitles = modules
    .filter((m) => !m.isCompleted)
    .map((m) => m.title);

  const prompt = `
Generate ONE new learning module as the next logical step.

CONTEXT:
Goal: "${goalPlan.goalTitle}"
Level: ${goalPlan.userLevel}
Completed Modules: ${
    completedTitles.length ? completedTitles.join(", ") : "None"
  }
Remaining Modules: ${
    remainingTitles.length ? remainingTitles.join(", ") : "None"
  }

REQUIREMENTS:
- Slightly more advanced than "${completedModule.title}"
- Must NOT repeat titles in remaining modules
- Exactly TWO real resources (valid URLs)

OUTPUT:
{
  "modules": [{
    "order": 0,
    "title": "Unique title",
    "description": "2-3 sentence explanation",
    "resources": [
      {
        "title": "Resource title",
        "url": "https://valid-link.com",
        "sourceType": "VIDEO|ARTICLE|COURSE|DOCUMENTATION",
        "description": "1 sentence summary"
      }
    ]
  }]
}
  `.trim();

  let aiResponse;
  try {
    aiResponse = await generateAdaptiveSuggestion(prompt);
  } catch (err) {
    console.error("Gemini suggestion call failed:", err);
    return null;
  }

  if (!aiResponse || !aiResponse.modules) return null;

  const candidate = aiResponse.modules[0];
  if (!candidate) return null;

  const normalized = {
    order: typeof candidate.order === "number" ? candidate.order : 0,
    title: candidate.title?.trim(),
    description: candidate.description?.trim(),
    resources: (candidate.resources || [])
      .map((r) => ({
        title: r.title?.trim(),
        url: r.url?.trim(),
        sourceType: (r.sourceType || "OTHER").toUpperCase(),
        description: r.description?.trim(),
      }))
      .filter(
        (r) =>
          r.url &&
          !r.url.includes("example.com") &&
          !r.url.includes("placeholder")
      ),
  };

  if (
    !normalized.title ||
    normalized.resources.length < 2 ||
    remainingTitles.some(
      (t) => t.toLowerCase() === normalized.title.toLowerCase()
    )
  ) {
    return null;
  }

  return normalized;
}

module.exports = { updateGoalProgress, generateSuggestion };
