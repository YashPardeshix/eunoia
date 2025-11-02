require("dotenv").config({ path: "../.env" });
const DB = require("./db");

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Eunoia Server is Live and Connected to MongoDB!" });
});

DB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
