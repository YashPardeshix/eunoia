const express = require("express");
const router = express.Router();
const {
  createGoal,
  getGoalById,
  getMyGoals,
} = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createGoal);

router.get("/mygoals", protect, getMyGoals);

router.get("/:goalId", protect, getGoalById);

module.exports = router;
