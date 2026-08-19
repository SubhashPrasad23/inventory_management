const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  upgradePlan,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/upgrade-plan", protect, upgradePlan);

module.exports = router;
