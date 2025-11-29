const express = require("express");
const router = express.Router();

const { googleSearch } = require("../services/googleSearchService");
const { searchSerpForTopic } = require("../services/serpService");

router.get("/search", async (req, res) => {
  const engine = req.query.engine;
  const q = req.query.q || "";

  try {
    let results = [];

    if (engine === "google") {
      results = await googleSearch(q);
    } else if (engine === "serp") {
      results = await searchSerpForTopic(q);
    } else if (engine === "gemini") {
      results = await geminiUrlSearch(q, 5);
    } else {
      return res.status(400).json({
        error: "Invalid engine. Use google, serp, gemini.",
      });
    }

    return res.json({ engine, q, results });
  } catch (err) {
    console.error("Debug search error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
