require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const goalRoutes = require("./routes/goalRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const DB = require("./db");

const app = express();
DB();

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: "Too many requests, slow down.",
});

const heavyLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: "Too many roadmap requests, try again later.",
});

app.use(helmet());
app.use(cors());
app.use(globalLimiter);
app.use(express.json());

app.use("/api/goals", heavyLimiter, goalRoutes);

app.use("/api/modules", moduleRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Eunoia Server is Live and Connected to MongoDB!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
