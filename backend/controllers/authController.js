const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { email, password, shopName, shopType } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: shopName,
      email,
      password: hashedPassword,
      shopName,
      shopType: shopType || "retailer",
      plan: "starter",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      shopName: user.shopName,
      shopType: user.shopType,
      plan: user.plan,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req)

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      shopName: user.shopName,
      shopType: user.shopType,
      plan: user.plan,
      phone: user.phone,
      address: user.address,
      gstNumber: user.gstNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  console.log(req)
  try {
    const user = await User.findById(req.user._id).select("-password");
    console.log(user)
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.shopName = req.body.shopName || user.shopName;
      user.shopType = req.body.shopType || user.shopType;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.gstNumber = req.body.gstNumber || user.gstNumber;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        shopName: updatedUser.shopName,
        shopType: updatedUser.shopType,
        plan: updatedUser.plan,
        phone: updatedUser.phone,
        address: updatedUser.address,
        gstNumber: updatedUser.gstNumber,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upgrade plan
const upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const validPlans = ["starter", "business", "pro"];

    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan },
      { new: true }
    ).select("-password");

    res.json({ message: `Plan upgraded to ${plan}`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  upgradePlan,
};
