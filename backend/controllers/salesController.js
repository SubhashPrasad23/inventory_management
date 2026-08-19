const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Generate unique invoice number
const generateInvoiceNumber = async (userId) => {
  const count = await Sale.countDocuments({ owner: userId });
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
};

// Create new bill/sale
const createSale = async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, paymentMode, discount, note } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: "Customer name and at least one item are required" });
    }

    // Validate stock availability and build sale items
    const saleItems = [];
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        owner: req.user._id,
      });

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productName}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
        });
      }

      saleItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: item.price || product.salePrice,
        itemTotal: item.quantity * (item.price || product.salePrice),
      });
    }

    // Calculate total
    const totalAmount = saleItems.reduce((sum, item) => sum + item.itemTotal, 0);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(req.user._id);

    // Apply discount
    const discountPercent = discount || 0;
    const discountAmount = totalAmount * discountPercent / 100;
    const finalAmount = totalAmount - discountAmount;

    // Create the sale
    const sale = await Sale.create({
      invoiceNumber,
      customerName,
      customerPhone: customerPhone || "",
      customerAddress: customerAddress || "",
      items: saleItems,
      totalAmount: finalAmount,
      discount: discountPercent,
      note: note || "",
      paymentMode: paymentMode || "cash",
      owner: req.user._id,
    });

    // Update product quantities (reduce stock)
    for (const item of saleItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Update or create customer record
    const existingCustomer = await Customer.findOne({
      name: customerName,
      owner: req.user._id,
    });

    if (existingCustomer) {
      existingCustomer.totalPurchases += 1;
      existingCustomer.totalSpent += totalAmount;
      existingCustomer.phone = customerPhone || existingCustomer.phone;
      existingCustomer.address = customerAddress || existingCustomer.address;
      await existingCustomer.save();
    } else {
      await Customer.create({
        name: customerName,
        phone: customerPhone || "",
        address: customerAddress || "",
        totalPurchases: 1,
        totalSpent: totalAmount,
        owner: req.user._id,
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all sales (paginated)
const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 15, startDate, endDate, search } = req.query;

    let filter = { owner: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search by customer name or invoice number
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }

    const limitNum = Number(limit) || 15;
    const pageNum = Number(page) || 1;

    const sales = await Sale.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Sale.countDocuments(filter);

    res.json({
      sales,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalSales: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get today's sales summary
const getTodaySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalBills = todaySales.length;
    const totalItems = todaySales.reduce(
      (sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0),
      0
    );

    res.json({
      totalRevenue,
      totalBills,
      totalItems,
      sales: todaySales,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  getTodaySummary,
};
