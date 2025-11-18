const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash-exp"];

function getClient(modelName) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
}

async function runModel(prompt, modelName) {
  try {
    const model = getClient(modelName);
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    return { data: JSON.parse(text), modelUsed: modelName };
  } catch (err) {
    return { data: null, error: err, modelUsed: modelName };
  }
}

async function tryFallback(prompt) {
  for (const model of MODELS) {
    const out = await runModel(prompt, model);
    if (out.data && !out.error) return out;
    console.log(`Model failed or invalid JSON: ${model}`);
  }
  return { data: null, modelUsed: null };
}

async function generateFullRoadmap(goalTitle, userLevel) {
  const prompt = `
You are an expert learning roadmap architect. Return VALID JSON ONLY.

GOAL: "${goalTitle}"
LEVEL: ${userLevel}

OUTPUT:
{
  "modules": [
    {
      "order": 1,
      "title": "Specific module title",
      "description": "2-3 sentence explanation",
      "estimatedHours": 6,
      "resources": [
        {
          "title": "Resource Name",
          "url": "https://working-link.com",
          "sourceType": "VIDEO|ARTICLE|COURSE|DOCUMENTATION",
          "description": "1 sentence summary"
        }
      ]
    }
  ]
}

RULES:
- 6-7 modules, clear progression
- 2-4 REAL resources per module
- No example.com or placeholder URLs
- Use only verified sources

Return ONLY the JSON.
  `.trim();

  const result = await tryFallback(prompt);
  return result.data;
}

async function generateAdaptiveSuggestion(contextPrompt) {
  const prompt = `
You are an adaptive learning system. Return VALID JSON ONLY.

${contextPrompt}

OUTPUT:
{
  "modules": [{
    "order": 0,
    "title": "Unique, specific title",
    "description": "2-3 sentences",
    "estimatedHours": 4,
    "resources": [
      {
        "title": "Resource Name",
        "url": "https://working-link.com",
        "sourceType": "VIDEO|ARTICLE|COURSE|DOCUMENTATION",
        "description": "1 sentence summary"
      }
    ]
  }]
}

RULES:
- 1 module only
- Must build on previous work
- Exactly 2 real resources
- No placeholder URLs

Return ONLY the JSON.
  `.trim();

  const result = await tryFallback(prompt);
  return result.data;
}

module.exports = {
  generateFullRoadmap,
  generateAdaptiveSuggestion,
};
