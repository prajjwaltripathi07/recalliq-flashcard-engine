require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const deckRoutes = require("./routes/deckRoutes");
const cardRoutes = require("./routes/cardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/decks", deckRoutes);
app.use("/api/cards", cardRoutes);

app.get("/", (req, res) => {
  res.send("RecallIQ backend is running");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });