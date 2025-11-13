const express = require("express");
const router = express.Router();
const { createGoal, getGoalById } = require("../controllers/goalController");

router.post("/", createGoal);
router.get("/:goalId", getGoalById);

module.exports = router;
