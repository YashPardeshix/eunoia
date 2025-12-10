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

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "https://eunoia-sable.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
