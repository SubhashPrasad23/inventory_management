const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPurchase,
  getPurchases,
  getPurchaseById,
} = require("../controllers/purchaseController");

router.post("/", protect, createPurchase);
router.get("/", protect, getPurchases);
router.get("/:id", protect, getPurchaseById);

module.exports = router;
