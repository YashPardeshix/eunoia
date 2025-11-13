const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");

router.get("/module/:moduleId", async (req, res) => {
  try {
    const resources = await Resource.find({
      moduleId: req.params.moduleId,
    });

    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (err) {
    console.error("Error getting resources", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching resources",
    });
  }
});

module.exports = router;
