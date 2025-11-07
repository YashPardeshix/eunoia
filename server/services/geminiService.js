const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateRoadmapFromGemini = async (goalTitle, userLevel) => {
  const prompt = `
  You are an expert learning roadmap planner. Generate a JSON object ONLY with the following structure:

  {
    "modules": [
      {
        "order": 1,
        "title": "Intro to X",
        "description": "Short summary of the module.",
        "resources": [
          {
            "title": "Resource name",
            "url": "https://...",
            "sourceType": "VIDEO|ARTICLE|BOOK|COURSE|OTHER",
            "description": "Short description of the resource."
          }
        ]
      }
    ]
  }

  Rules:
  - Generate 3–5 modules.
  - Each module must have 2–3 resources.
  - No prose, no markdown, no extra text.

  Goal: "${goalTitle}"
  Level: "${userLevel}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanText = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanText);

    return data;
  } catch (err) {
    console.error("Gemini JSON parse failed:", err.message);
    throw new Error("AI returned invalid JSON. Could not generate roadmap.");
  }
};

module.exports = { generateRoadmapFromGemini };
