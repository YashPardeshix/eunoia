require("dotenv").config({ path: "../.env" });
const goalRoutes = require("./routes/goalRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const DB = require("./db");
const resourceRoutes = require("./routes/resourceRoutes");

const express = require("express");
const app = express();

DB();

app.use(express.json());

app.use("/api/goals", goalRoutes);

app.use("/api/modules", moduleRoutes);

app.use("/api/resources", resourceRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Eunoia Server is Live and Connected to MongoDB!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
