const express = require("express");
const router = express.Router();

const {
  generateSuggestions,
  acceptSuggestion,
} = require("../controllers/suggestionController");

router.post("/:goalId/generate", generateSuggestions);

router.post("/:goalId/accept", acceptSuggestion);

module.exports = router;
