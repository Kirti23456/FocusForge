const express = require("express");

const {
  register,
  login,
  getMe,
  googleLogin,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get current user
router.get("/me", authMiddleware, getMe);

// Google Login
router.post("/google", googleLogin);

// Logout
router.post("/logout", logout);


module.exports = router;