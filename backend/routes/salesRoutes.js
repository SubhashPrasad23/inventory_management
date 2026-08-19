const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { checkBillLimit } = require("../middleware/planLimits");
const {
  createSale,
  getSales,
  getSaleById,
  getTodaySummary,
} = require("../controllers/salesController");
const { generateInvoicePDF } = require("../utils/pdfGenerator");
const Sale = require("../models/Sale");
const User = require("../models/User");

router.post("/", protect, checkBillLimit, createSale);
router.get("/", protect, getSales);
router.get("/today", protect, getTodaySummary);
router.get("/:id", protect, getSaleById);

router.get("/invoice/:id", protect, async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const user = await User.findById(req.user._id);
    const shopInfo = {
      shopName: user.shopName,
      address: user.address,
      phone: user.phone,
      gstNumber: user.gstNumber,
    };

    const template = req.query.template || "professional";
    generateInvoicePDF(sale, shopInfo, res, template);
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
});

module.exports = router;
