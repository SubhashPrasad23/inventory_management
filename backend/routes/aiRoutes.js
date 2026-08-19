const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { checkAiAccess } = require("../middleware/planLimits");
const {
  getDashboardInsights,
  askAiAssistant,
  getStockPredictions,
  suggestCategory,
  getCustomerSuggestions,
  suggestPrice,
  generateDailyReport,
} = require("../controllers/aiController");

router.get("/insights", protect, checkAiAccess, getDashboardInsights);
router.post("/ask", protect, checkAiAccess, askAiAssistant);
router.get("/predictions", protect, checkAiAccess, getStockPredictions);
router.post("/suggest-category", protect, suggestCategory);
router.get("/customer-suggestions", protect, getCustomerSuggestions);
router.post("/suggest-price", protect, suggestPrice);
router.get("/daily-report", protect, checkAiAccess, generateDailyReport);

module.exports = router;
