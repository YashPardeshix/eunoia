const fetch = require("node-fetch");
require("dotenv").config();

async function searchSerpForTopic(q) {
  if (!process.env.SERP_API_KEY) {
    console.warn("⚠️ SerpAPI: Missing API Key");
    return [];
  }

  try {
    const params = new URLSearchParams({
      engine: "google",
      q,
      api_key: process.env.SERP_API_KEY,
      num: "5",
    });

    const res = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    const json = await res.json();

    if (json.error) {
      if (
        json.error.toLowerCase().includes("limit") ||
        json.error.includes("Unauthorized")
      ) {
        console.error("🔴 SERP API QUOTA EXHAUSTED or Invalid Key");
      } else {
        console.error("SerpAPI Error:", json.error);
      }
      return [];
    }

    const results = (json.organic_results || []).map((r) => ({
      title: r.title,
      url: r.link || r.url,
      description: r.snippet || r.description || "",
      sourceType: "",
    }));
    return results;
  } catch (err) {
    console.error("SerpAPI Network Error:", err.message);
    return [];
  }
}

module.exports = { searchSerpForTopic };
