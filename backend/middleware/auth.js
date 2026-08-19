const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Check subscription plan
const checkPlan = (requiredPlans) => {
  return (req, res, next) => {
    if (!requiredPlans.includes(req.user.plan)) {
      return res.status(403).json({
        message: "Upgrade your plan to access this feature",
        currentPlan: req.user.plan,
        requiredPlans: requiredPlans,
      });
    }
    next();
  };
};

module.exports = { protect, checkPlan };
