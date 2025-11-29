// checkEnv.js
require("dotenv").config();

console.log("Checking Environment Variables...");
console.log(
  "GOOGLE_KEY:",
  process.env.GOOGLE_API_KEY ? "✅ Loaded" : "❌ MISSING"
);
console.log("GOOGLE_CX:", process.env.GOOGLE_CX ? "✅ Loaded" : "❌ MISSING");
console.log("SERP_KEY:", process.env.SERP_API_KEY ? "✅ Loaded" : "❌ MISSING");
