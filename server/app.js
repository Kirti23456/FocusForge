const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const aiRoutes = require("./routes/aiRoutes");
const quizRoutes = require("./routes/quizRoutes");

const friendRoutes = require("./routes/friendRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const authRoutes = require("./routes/authRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const calendarRoutes = require("./routes/calendarRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use(
  "/api/study-sessions",
  studySessionRoutes
);

app.use("/api/friends", friendRoutes);

app.use(
  "/api/challenges",
  challengeRoutes
);

app.use(
  "/api/reminders",
  reminderRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/calendar",
  calendarRoutes
);

app.use("/api/ai", aiRoutes);

// ⭐ NEW QUIZ ROUTE
app.use("/api/quiz", quizRoutes);

// ==========================================
// TEST
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "FocusForge API Running 🚀",
  });
});

module.exports = app;