const express = require("express");
const router = express.Router();
const { updateModule } = require("../controllers/moduleController");

router.put("/:id", updateModule);

module.exports = router;
