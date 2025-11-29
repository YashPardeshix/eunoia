const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "LearningModule",
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["VIDEO", "ARTICLE", "BOOK", "COURSE", "DOCUMENTATION", "OTHER"],
      default: "OTHER",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", ResourceSchema);
module.exports = Resource;
