const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendChallenge,
  getMyChallenges,
  acceptChallenge,
  rejectChallenge,
} = require("../controllers/challengeController");

const router = express.Router();


// SEND CHALLENGE
router.post(
  "/",
  authMiddleware,
  sendChallenge
);


// GET MY CHALLENGES
router.get(
  "/",
  authMiddleware,
  getMyChallenges
);


// ACCEPT CHALLENGE
router.put(
  "/:id/accept",
  authMiddleware,
  acceptChallenge
);


// REJECT CHALLENGE
router.put(
  "/:id/reject",
  authMiddleware,
  rejectChallenge
);


module.exports = router;