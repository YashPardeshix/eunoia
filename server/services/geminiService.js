const { GoogleGenerativeAI } = require("@google/generative-ai");
const { googleSearch } = require("./googleSearchService");
const { searchYouTubePlayable } = require("./youtubeService");
const redis = require("../config/redis");
require("dotenv").config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  "gemini-exp-1206",
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash-exp",
  "gemini-2.5-pro",
];

function cleanJsonText(text) {
  let cleaned = text.replace(/```json|```/g, "").trim();

  const firstOpen = cleaned.indexOf("{");
  const lastClose = cleaned.lastIndexOf("}");
  if (firstOpen !== -1 && lastClose !== -1) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }

  return cleaned.replace(/[\x00-\x1F\x7F]/g, "");
}

async function runModel(prompt, modelName) {
  try {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const raw = result.response.text() || "";

    const cleaned = cleanJsonText(raw);
    try {
      return { data: JSON.parse(cleaned), error: null };
    } catch (parseError) {
      console.warn(
        `⚠️ JSON Parse failed on ${modelName}. Attempting repair...`
      );
      const repaired = cleaned.replace(/\\/g, "/");
      return { data: JSON.parse(repaired), error: null };
    }
  } catch (err) {
    console.error(`❌ Model ${modelName} failed:`, err.message);
    return { data: null, error: err };
  }
}

async function tryFallback(prompt) {
  for (const model of MODELS) {
    console.log(`🤖 Trying model: ${model}...`);
    const out = await runModel(prompt, model);

    if (out.data) return out;

    if (
      out.error &&
      (out.error.message.includes("429") || out.error.message.includes("503"))
    ) {
      console.log("⏳ Rate limit/Busy. Waiting 2s...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return { data: null };
}

function cleanQuery(goal, moduleTitle) {
  const raw = `${goal} ${moduleTitle}`;
  return raw
    .replace(/Module \d+[:|-]?/gi, "")
    .replace(/(Introduction|Basics|Advanced|Guide|to|the|of)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function detectType(url, title) {
  const u = url.toLowerCase();
  const t = title.toLowerCase();
  if (u.includes("udemy") || u.includes("coursera") || u.includes("edx"))
    return "COURSE";
  if (
    u.includes("docs") ||
    t.includes("documentation") ||
    u.includes("developer.")
  )
    return "DOCUMENTATION";
  if (u.includes("amazon") || u.includes("books")) return "BOOK";
  return "ARTICLE";
}

async function generateBackupLinks(query) {
  console.log(`🤖 AI BACKUP: Generating synthetic links for "${query}"...`);
  try {
    const model = client.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Task: Provide 3 high-authority URL resources for: "${query}".
      Rules:
      1. ONLY use homepages or major section pages (e.g., developer.mozilla.org, wikipedia.org).
      2. Return JSON: [{"title": "Name", "url": "https://...", "type": "ARTICLE"}]
    `;

    const result = await model.generateContent(prompt);
    const text = cleanJsonText(result.response.text());
    const json = JSON.parse(text);
    return Array.isArray(json) ? json.slice(0, 3) : [];
  } catch (e) {
    return [];
  }
}

async function ensureResources(
  goalTitle,
  moduleTitle,
  videoLimit = 3,
  mixedLimit = 3
) {
  const cleanTerm = cleanQuery(goalTitle, moduleTitle);
  const videoQuery = `${cleanTerm} tutorial`;
  const mixedQuery = `${cleanTerm} documentation course book guide -site:youtube.com`;

  console.log(`🔎 SEARCHING: "${cleanTerm}"`);

  const [ytResult, googleResult] = await Promise.allSettled([
    searchYouTubePlayable(videoQuery, 5),
    googleSearch(mixedQuery),
  ]);

  const rawVideos = ytResult.status === "fulfilled" ? ytResult.value : [];
  if (rawVideos.length > 0)
    console.log(`   ✅ YouTube: Found ${rawVideos.length} videos`);

  const finalVideos = rawVideos.slice(0, videoLimit).map((v) => ({
    title: v.title,
    url: v.url,
    sourceType: "VIDEO",
    description: v.description || "Video Tutorial",
  }));

  let rawMixed = googleResult.status === "fulfilled" ? googleResult.value : [];

  if (rawMixed.length > 0) {
    console.log(`   ✅ Google Search: Found ${rawMixed.length} results`);
  }

  if (rawMixed.length === 0 && process.env.SERP_API_KEY) {
    console.log(`   ⚠️ Google failed. Attempting SerpAPI fallback...`);
    try {
      const { searchSerpForTopic } = require("./serpService");
      rawMixed = await searchSerpForTopic(mixedQuery);
      console.log(`   ✅ SerpAPI: Found ${rawMixed.length} results`);
    } catch (e) {
      console.log(`   ❌ SerpAPI failed: ${e.message}`);
    }
  }

  let filteredMixed = rawMixed.filter(
    (r) => r.url && !r.url.includes("youtube") && !r.url.includes("vimeo")
  );

  if (filteredMixed.length > mixedLimit) {
    filteredMixed = shuffleArray(filteredMixed);
  }

  let finalMixed = filteredMixed.slice(0, mixedLimit).map((r) => ({
    title: r.title,
    url: r.url,
    sourceType: detectType(r.url, r.title).toUpperCase(),
    description: r.description || "Web Resource",
  }));

  if (finalMixed.length < 1) {
    const aiLinks = await generateBackupLinks(cleanTerm);
    if (aiLinks.length > 0)
      console.log(`   🤖 AI Backup: Generated ${aiLinks.length} links`);
    finalMixed = [...finalMixed, ...aiLinks].slice(0, mixedLimit);
  }

  if (finalMixed.length === 0) {
    console.log(`   🚩 ALL FAILED. Fallback to Wikipedia.`);
    finalMixed.push({
      title: `${cleanTerm} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
        cleanTerm
      )}`,
      sourceType: "ARTICLE",
      description: "Encyclopedia Overview",
    });
  }

  return [...finalVideos, ...finalMixed];
}

async function generateFullRoadmap(goalTitle, userLevel) {
  const cacheKey = `roadmap:${goalTitle
    .toLowerCase()
    .trim()}:${userLevel.toLowerCase()}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("🚀 HIT: Serving Roadmap from Redis Cache");
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn(
        "⚠️ Redis Read Error (Proceeding with generation):",
        e.message
      );
    }
  }

  console.log("🐢 MISS: Generating Roadmap via AI...");

  const prompt = `
    Role: Expert Curriculum Designer & Technical Principal.
    Goal: Create a rigorous learning path for "${goalTitle}" (Level: ${userLevel}).
    
    Task: Design exactly 6 learning modules.
    Requirements:
    1. Titles must be action-oriented and professional (e.g., "Advanced patterns" vs "More stuff").
    2. Progression must be logical: Theory -> Implementation -> Mastery.
    3. Descriptions must mention specific skills or concepts covered.
    4. CONSTRAINT: Do NOT use backslashes in your output.

    Output (JSON ONLY):
    {
      "modules": [
        { "order": 1, "title": "...", "description": "...", "estimatedHours": 4 }
      ]
    }
  `;

  const result = await tryFallback(prompt);
  if (!result?.data || !Array.isArray(result.data.modules)) {
    console.error("All models failed. Check API Key or Model names.");
    return null;
  }

  const hydratedModules = await Promise.all(
    result.data.modules.slice(0, 6).map(async (mod, index) => {
      const resources = await ensureResources(goalTitle, mod.title, 3, 3);
      return {
        ...mod,
        order: index + 1,
        resources,
      };
    })
  );

  const finalResult = { modules: hydratedModules };

  if (redis && finalResult.modules.length > 0) {
    try {
      await redis.set(cacheKey, JSON.stringify(finalResult), "EX", 604800);
      console.log("💾 SAVED to Redis Cache");
    } catch (e) {
      console.warn("⚠️ Redis Write Error:", e.message);
    }
  }

  return finalResult;
}

async function generateCompletionSuggestions(goalTitle, completedModules = []) {
  const completedNames = (completedModules || [])
    .map((m) => m.title)
    .join(", ");

  const prompt = `
    Role: Senior Career Coach & Industry Expert.
    Context: User has completed a core curriculum on "${goalTitle}".
    Completed Topics: ${completedNames}.
    
    Task: Suggest exactly 3 high-value Specialization paths.
    Requirements:
    1. Topics must be niche and highly employable (e.g., "Performance Optimization" or "Security Architecture").
    2. Do NOT suggest generic basics.
    3. CONSTRAINT: Do NOT use backslashes in your output.
    
    Output (JSON ONLY):
    {
      "suggestions": [
        { 
          "title": "...", 
          "description": "...", 
          "difficulty": "ADVANCED", 
          "estimatedHours": 6 
        }
      ]
    }
  `;

  const result = await tryFallback(prompt);
  if (!result?.data || !Array.isArray(result.data.suggestions)) return [];

  const hydratedSuggestions = await Promise.all(
    result.data.suggestions.slice(0, 3).map(async (suggestion) => {
      const resources = await ensureResources(
        goalTitle,
        suggestion.title,
        1,
        1
      );
      return {
        title: suggestion.title,
        description: suggestion.description,
        difficulty: (suggestion.difficulty || "ADVANCED").toUpperCase(),
        estimatedHours: suggestion.estimatedHours || 5,
        resources: resources,
      };
    })
  );

  return hydratedSuggestions;
}

module.exports = {
  generateFullRoadmap,
  generateCompletionSuggestions,
};
