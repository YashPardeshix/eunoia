require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const goalRoutes = require("./routes/goalRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const debugRoutes = require("./routes/debugRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const DB = require("./db");

const app = express();
DB();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/debug", debugRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Eunoia Server is Live and Connected to MongoDB!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
