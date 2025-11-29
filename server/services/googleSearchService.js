const fetch = require("node-fetch");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

async function googleSearch(query) {
  try {
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.warn("⚠️ Google Search: Missing API Key or CX");
      return [];
    }

    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CX,
      q: query,
      num: "5",
    });

    const res = await fetch(
      "https://www.googleapis.com/customsearch/v1?" + params.toString()
    );

    const json = await res.json();

    if (!res.ok) {
      if (
        res.status === 429 ||
        (json.error && json.error.message.includes("quota"))
      ) {
        console.error("🔴 GOOGLE SEARCH QUOTA EXHAUSTED (Status 429/403)");
      } else {
        console.error(
          `Google Search Error (${res.status}):`,
          json.error?.message
        );
      }
      return [];
    }

    if (!json.items) return [];

    return json.items.map((item) => ({
      title: item.title || "",
      url: item.link || "",
      description: item.snippet || "",
      sourceType: "",
    }));
  } catch (err) {
    console.error("Google Search Network Error:", err.message);
    return [];
  }
}

module.exports = { googleSearch };
