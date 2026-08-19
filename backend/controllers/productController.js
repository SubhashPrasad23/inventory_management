const Product = require("../models/Product");

// Get all products for current user (with optional pagination)
const getProducts = async (req, res) => {
  try {
    const { page, limit = 20, search, category } = req.query;

    let filter = { owner: req.user._id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (!page) {
      const products = await Product.find(filter)
        .populate("supplier", "name")
        .sort({ createdAt: -1 });
      return res.json(products);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const products = await Product.find(filter)
      .populate("supplier", "name")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("supplier", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get product by barcode
const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const product = await Product.findOne({
      barcode: barcode,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "No product found with this barcode" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search products by name (fuzzy search)
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Use regex for flexible matching
    const products = await Product.find({
      owner: req.user._id,
      name: { $regex: query, $options: "i" },
    }).limit(10);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const { name, barcode, category, purchasePrice, salePrice, quantity, unit, minStockLevel, supplier } = req.body;

    // if barcode already exists for this user, update stock instead of creating duplicate
    if (barcode) {
      const existing = await Product.findOne({ barcode, owner: req.user._id });
      if (existing) {
        // add new quantity to existing stock
        existing.quantity += Number(quantity) || 0;
        existing.purchasePrice = purchasePrice || existing.purchasePrice;
        existing.salePrice = salePrice || existing.salePrice;
        existing.name = name || existing.name;
        existing.category = category || existing.category;
        await existing.save();
        return res.status(200).json(existing);
      }
    }

    const product = await Product.create({
      name,
      barcode: barcode || "",
      category: category || "General",
      purchasePrice,
      salePrice,
      quantity,
      unit: unit || "pcs",
      minStockLevel: minStockLevel || 5,
      supplier: supplier || null,
      owner: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      owner: req.user._id,
      $expr: { $lte: ["$quantity", "$minStockLevel"] },
    }).sort({ quantity: 1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByBarcode,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
};
