const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

// Create new purchase
const createPurchase = async (req, res) => {
  try {
    const { supplierName, supplier, items, invoiceNumber, notes } = req.body;

    if (!supplierName || !items || items.length === 0) {
      return res.status(400).json({ message: "Supplier name and at least one item are required" });
    }

    // Build purchase items
    const purchaseItems = [];
    for (const item of items) {
      purchaseItems.push({
        product: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        itemTotal: item.quantity * item.price,
      });
    }

    // Calculate total
    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.itemTotal, 0);

    // Create purchase record
    const purchase = await Purchase.create({
      supplier: supplier || null,
      supplierName,
      items: purchaseItems,
      totalAmount,
      invoiceNumber: invoiceNumber || "",
      notes: notes || "",
      owner: req.user._id,
    });

    // Update product quantities (increase stock)
    for (const item of purchaseItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all purchases
const getPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const purchases = await Purchase.find({ owner: req.user._id })
      .populate("supplier", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Purchase.countDocuments({ owner: req.user._id });

    res.json({
      purchases,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalPurchases: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get one purchase
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("supplier", "name");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
};
