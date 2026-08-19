const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");

// Plan limits configuration
const PLAN_LIMITS = {
  starter: {
    maxProducts: 50,
    maxBillsPerMonth: 50,
    maxCustomers: 20,
    maxSuppliers: 20,
    aiAccess: false,
    reportsAccess: false,
    scannerAccess: false, 
    pdfWatermark: true,
  },
  business: {
    maxProducts: 500,
    maxBillsPerMonth: Infinity,
    maxCustomers: Infinity,
    maxSuppliers: Infinity,
    aiAccess: true, 
    reportsAccess: true,
    scannerAccess: true,
    pdfWatermark: false,
  },
  pro: {
    maxProducts: Infinity,
    maxBillsPerMonth: Infinity,
    maxCustomers: Infinity,
    maxSuppliers: Infinity,
    aiAccess: true, 
    reportsAccess: true,
    scannerAccess: true,
    pdfWatermark: false,
  },
};

const checkProductLimit = async (req, res, next) => {
  const plan = req.user.plan;
  const limit = PLAN_LIMITS[plan].maxProducts;

  if (limit !== Infinity) {
    const count = await Product.countDocuments({ owner: req.user._id });
    if (count >= limit) {
      return res.status(403).json({
        message: `Product limit reached (${limit}). Upgrade your plan to add more.`,
        currentCount: count,
        limit: limit,
      });
    }
  }
  next();
};

const checkBillLimit = async (req, res, next) => {
  const plan = req.user.plan;
  const limit = PLAN_LIMITS[plan].maxBillsPerMonth;

  if (limit !== Infinity) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await Sale.countDocuments({
      owner: req.user._id,
      createdAt: { $gte: startOfMonth },
    });

    if (count >= limit) {
      return res.status(403).json({
        message: `Monthly bill limit reached (${limit}). Upgrade your plan.`,
        currentCount: count,
        limit: limit,
      });
    }
  }
  next();
};

const checkAiAccess = (req, res, next) => {
  const plan = req.user.plan;
  if (!PLAN_LIMITS[plan].aiAccess) {
    return res.status(403).json({
      message: "AI features are not available on your current plan. Upgrade to Business or Pro.",
      currentPlan: plan,
    });
  }
  next();
};

module.exports = {
  PLAN_LIMITS,
  checkProductLimit,
  checkBillLimit,
  checkAiAccess,
};
