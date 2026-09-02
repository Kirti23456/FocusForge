require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("===== FOCUSFORGE SERVER =====");

    console.log(
      "GEMINI KEY EXISTS:",
      !!process.env.GEMINI_API_KEY
    );

    console.log(
      "MONGO URI EXISTS:",
      !!process.env.MONGODB_URI
    );

    // ==========================================
    // ENVIRONMENT CHECK
    // ==========================================

    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is missing from .env"
      );
    }

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from .env"
      );
    }

    // ==========================================
    // MONGODB CONNECTION
    // ==========================================

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    // ==========================================
    // START SERVER
    // ==========================================

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "❌ SERVER START ERROR:",
      error
    );

    process.exit(1);
  }
};

startServer();