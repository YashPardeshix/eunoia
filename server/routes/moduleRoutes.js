const express = require("express");
const router = express.Router();
const { updatedModue } = require("../controllers/moduleController");

router.put("/:id", updateModule);

module.exports = router;
