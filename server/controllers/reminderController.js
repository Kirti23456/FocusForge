const Reminder = require("../models/Reminder");

// ======================================================
// CREATE REMINDER
// ======================================================

const createReminder = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      repeat,
    } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Title, date and time are required",
      });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      date,
      time,
      repeat: repeat || "once",
      completed: false,
      notified: false,
    });

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    console.error("CREATE REMINDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create reminder",
    });
  }
};

// ======================================================
// GET MY REMINDERS
// ======================================================

const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user.id,
    }).sort({
      date: 1,
      time: 1,
    });

    return res.status(200).json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error("GET REMINDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reminders",
    });
  }
};

// ======================================================
// UPDATE REMINDER
// ======================================================

const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    const {
      title,
      description,
      date,
      time,
      repeat,
    } = req.body;

    if (title !== undefined) {
      reminder.title = title.trim();
    }

    if (description !== undefined) {
      reminder.description = description.trim();
    }

    if (date !== undefined) {
      reminder.date = date;
    }

    if (time !== undefined) {
      reminder.time = time;
    }

    if (repeat !== undefined) {
      reminder.repeat = repeat;
    }

    // New/updated reminder should be pending again
    reminder.completed = false;
    reminder.notified = false;

    await reminder.save();

    return res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("UPDATE REMINDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reminder",
    });
  }
};

// ======================================================
// COMPLETE / UNCOMPLETE REMINDER
// ======================================================

const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    reminder.completed = !reminder.completed;

    await reminder.save();

    return res.status(200).json({
      success: true,
      message: reminder.completed
        ? "Reminder completed"
        : "Reminder marked as pending",
      reminder,
    });
  } catch (error) {
    console.error("COMPLETE REMINDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reminder",
    });
  }
};

// ======================================================
// DELETE REMINDER
// ======================================================

const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("DELETE REMINDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete reminder",
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  completeReminder,
  deleteReminder,
};