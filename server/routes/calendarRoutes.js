// const express = require("express");

// const authMiddleware = require("../middleware/authMiddleware");

// const {
//   getEvents,
//   createEvent,
//   updateEvent,
//   toggleEventCompleted,
//   deleteEvent,
// } = require("../controllers/calendarController");

// const router = express.Router();


// // GET ALL EVENTS
// router.get(
//   "/",
//   authMiddleware,
//   getEvents
// );


// // CREATE EVENT
// router.post(
//   "/",
//   authMiddleware,
//   createEvent
// );


// // UPDATE EVENT
// router.put(
//   "/:id",
//   authMiddleware,
//   updateEvent
// );


// // TOGGLE COMPLETED
// router.put(
//   "/:id/toggle",
//   authMiddleware,
//   toggleEventCompleted
// );


// // DELETE EVENT
// router.delete(
//   "/:id",
//   authMiddleware,
//   deleteEvent
// );


// module.exports = router;


const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getEvents,
  createEvent,
  updateEvent,
  toggleEventCompleted,
  deleteEvent,
} = require("../controllers/calendarController");

const router = express.Router();

// =====================================================
// GET ALL EVENTS
// =====================================================

router.get(
  "/",
  authMiddleware,
  getEvents
);

// =====================================================
// CREATE EVENT
// =====================================================

router.post(
  "/",
  authMiddleware,
  createEvent
);

// =====================================================
// UPDATE EVENT
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  updateEvent
);

// =====================================================
// TOGGLE COMPLETED
// =====================================================

router.put(
  "/:id/toggle",
  authMiddleware,
  toggleEventCompleted
);

// =====================================================
// DELETE EVENT
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteEvent
);

module.exports = router;