const fetch = require("node-fetch");
require("dotenv").config();

async function searchSerpForTopic(q) {
  if (!process.env.SERP_API_KEY) return [];
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
    const results = (json.organic_results || []).map((r) => ({
      title: r.title,
      url: r.link || r.url,
      description: r.snippet || r.description || "",
      sourceType: "",
    }));
    return results;
  } catch (err) {
    console.error("SerpAPI error:", err?.message || err);
    return [];
  }
}

module.exports = { searchSerpForTopic };
