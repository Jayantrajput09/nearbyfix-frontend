const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

console.log("=================================");
console.log("NEARBYFIX SERVER.JS LOADED");
console.log("=================================");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ================================
// HOME
// ================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NearbyFix API is running",
  });
});

// ================================
// TEST POST
// ================================

app.post("/api/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  console.log("BODY:", req.body);

  res.json({
    success: true,
    message: "Backend POST is working",
    body: req.body,
  });
});

// ================================
// AUTH ROUTES
// ================================

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `NearbyFix backend running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });