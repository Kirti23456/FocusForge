const CalendarEvent = require("../models/CalendarEvent");

// =====================================================
// GET ALL EVENTS
// =====================================================

const getEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find({
      user: req.user.id,
    }).sort({
      date: 1,
    });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("GET CALENDAR EVENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendar events",
    });
  }
};


// =====================================================
// CREATE EVENT
// =====================================================

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      duration,
      type,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: "Title and date are required",
      });
    }

    const event = await CalendarEvent.create({
      user: req.user.id,
      title,
      description: description || "",
      date: new Date(date),
      duration: Number(duration) || 60,
      type: type || "study",
    });

    return res.status(201).json({
      success: true,
      message: "Calendar event created",
      event,
    });
  } catch (error) {
    console.error("CREATE CALENDAR EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create calendar event",
    });
  }
};


// =====================================================
// UPDATE EVENT
// =====================================================

const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Calendar event not found",
      });
    }

    const {
      title,
      description,
      date,
      duration,
      type,
      completed,
    } = req.body;

    if (title !== undefined) {
      event.title = title;
    }

    if (description !== undefined) {
      event.description = description;
    }

    if (date !== undefined) {
      event.date = new Date(date);
    }

    if (duration !== undefined) {
      event.duration = Number(duration);
    }

    if (type !== undefined) {
      event.type = type;
    }

    if (completed !== undefined) {
      event.completed = Boolean(completed);
    }

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Calendar event updated",
      event,
    });
  } catch (error) {
    console.error("UPDATE CALENDAR EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update calendar event",
    });
  }
};


// =====================================================
// TOGGLE COMPLETED
// =====================================================

const toggleEventCompleted = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Calendar event not found",
      });
    }

    event.completed = !event.completed;

    await event.save();

    return res.status(200).json({
      success: true,
      message: event.completed
        ? "Event completed"
        : "Event marked incomplete",
      event,
    });
  } catch (error) {
    console.error(
      "TOGGLE CALENDAR EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};


// =====================================================
// DELETE EVENT
// =====================================================

const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Calendar event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Calendar event deleted",
    });
  } catch (error) {
  console.error("===== CREATE CALENDAR EVENT ERROR =====");
  console.error("Error message:", error.message);
  console.error("Error name:", error.name);
  console.error("Request body:", req.body);
  console.error("Request user:", req.user);
  console.error("========================================");

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
}


module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  toggleEventCompleted,
  deleteEvent,
};