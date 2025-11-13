const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function retry(fn, attempts = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const overloaded =
        err.message?.includes("503") ||
        err.message?.includes("overloaded") ||
        err.message?.includes("Service Unavailable");

      if (!overloaded) break;

      if (i < attempts - 1) {
        console.log(`Gemini overloaded. Retrying... (${i + 1}/${attempts})`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  throw lastError;
}

const generateRoadmapFromGemini = async (goalTitle, userLevel) => {
  const prompt = `
    You are an expert learning roadmap planner. 
Generate a JSON object ONLY with the following structure:

{
  "modules": [
    {
      "order": 1,
      "title": "Module title",
      "description": "Short summary",
      "resources": [
        {
          "title": "Resource name",
          "url": "https://real-link.com",
          "sourceType": "VIDEO|ARTICLE|BOOK|COURSE|OTHER",
          "description": "Short description"
        }
      ]
    }
  ]
}

Rules:
- Produce 3 to 5 modules.
- Each module must contain 2 to 4 real, valid learning resources.
- Use only real links from reputable websites.
- Allowed domains:
  - YouTube
  - Coursera
  - Udemy
  - freeCodeCamp
  - MDN Web Docs
  - W3Schools
  - TowardsDataScience
  - Real Python
  - official documentation sites

STRICT RULES:
- Do NOT use example.com or placeholder URLs.
- Do NOT use lorem ipsum anything.
- Do NOT invent fake company URLs.
- All URLs must be real, working links.
- Output must be valid JSON only. No extra text.

Goal: "${goalTitle}"
Level: "${userLevel}"
  `;

  try {
    const result = await retry(() => model.generateContent(prompt));

    const text = result.response.text();

    const clean = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(clean);
    } catch (innerErr) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }

      throw innerErr;
    }
  } catch (err) {
    console.error("Gemini JSON parse failed:", err.message);
    throw new Error("AI returned invalid JSON. Could not generate roadmap.");
  }
};

module.exports = { generateRoadmapFromGemini };
