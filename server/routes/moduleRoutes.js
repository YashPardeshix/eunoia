const express = require("express");
const router = express.Router();
const LearningModule = require("../models/LearningModule");
const { updateModule } = require("../controllers/moduleController");

router.put("/:id", updateModule);

router.get("/goal/:goalId", async (req, res) => {
  try {
    const modules = await LearningModule.find({ goalPlanId: req.params.goalId })
      .populate("resourceIds")
      .sort({ order: 1 });

    if (!modules || modules.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No modules found for this goal." });
    }

    res.status(200).json({ success: true, data: modules });
  } catch (err) {
    console.error("Error fetching modules by goalId:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching modules.",
    });
  }
});

module.exports = router;
