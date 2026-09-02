const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReminder,
  getReminders,
  updateReminder,
  completeReminder,
  deleteReminder,
} = require("../controllers/reminderController");

const router = express.Router();

// ======================================================
// CREATE REMINDER
// POST /api/reminders
// ======================================================

router.post(
  "/",
  authMiddleware,
  createReminder
);

// ======================================================
// GET LOGGED-IN USER REMINDERS
// GET /api/reminders
// ======================================================

router.get(
  "/",
  authMiddleware,
  getReminders
);

// ======================================================
// UPDATE REMINDER
// PUT /api/reminders/:id
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  updateReminder
);

// ======================================================
// COMPLETE / UNCOMPLETE
// PUT /api/reminders/:id/complete
// ======================================================

router.put(
  "/:id/complete",
  authMiddleware,
  completeReminder
);

// ======================================================
// DELETE
// DELETE /api/reminders/:id
// ======================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteReminder
);

module.exports = router;