const { generateAIResponse } = require("../config/gemini");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Purchase = require("../models/Purchase");

// Get AI Dashboard Insights
const getDashboardInsights = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
    });

    const products = await Product.find({ owner: req.user._id });
    const lowStockProducts = products.filter(
      (p) => p.quantity <= p.minStockLevel,
    );

    const totalRevenue7Days = recentSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const totalBills7Days = recentSales.length;
    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + p.quantity * p.purchasePrice,
      0,
    );

    // Find top selling products
    const productSalesMap = {};
    recentSales.forEach((sale) => {
      sale.items.forEach((item) => {
        productSalesMap[item.productName] =
          (productSalesMap[item.productName] || 0) + item.quantity;
      });
    });
    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const prompt = `You are a smart business assistant for a ${req.user.shopType} shop named "${req.user.shopName}". 
Here is the shop data for the last 7 days:
- Total Revenue: Rs ${totalRevenue7Days}
- Total Bills: ${totalBills7Days}
- Total Products in inventory: ${totalProducts}
- Total Stock Value: Rs ${totalStockValue}
- Low Stock Products (${lowStockProducts.length}): ${lowStockProducts.map((p) => p.name + " (" + p.quantity + " left)").join(", ") || "None"}
- Top Selling Products: ${topProducts.map(([name, qty]) => name + " (" + qty + " sold)").join(", ") || "No sales yet"}

Generate a brief, helpful business insight summary in 3-4 short sentences. Include a quick performance overview, one actionable suggestion, and any warnings about low stock. Keep it friendly and practical. No markdown formatting.`;

    const aiSummary = await generateAIResponse(prompt);

    res.json({
      summary: aiSummary,
      metrics: {
        totalRevenue7Days,
        totalBills7Days,
        totalProducts,
        totalStockValue,
        lowStockCount: lowStockProducts.length,
        topProducts,
      },
      lowStockProducts: lowStockProducts.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        minStockLevel: p.minStockLevel,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "AI service error", error: error.message });
  }
};

// AI Chat - Ask questions about your business
const askAiAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question)
      return res.status(400).json({ message: "Please provide a question" });

    const products = await Product.find({ owner: req.user._id });
    const recentSales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    const recentPurchases = await Purchase.find({
      owner: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const totalRevenue = recentSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpenses = recentPurchases.reduce(
      (sum, p) => sum + p.totalAmount,
      0,
    );
    const profit = totalRevenue - totalExpenses;

    const productSummary = products.slice(0, 20).map((p) => ({
      name: p.name,
      stock: p.quantity,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      category: p.category,
    }));

    const prompt = `You are an AI business assistant for a ${req.user.shopType} shop named "${req.user.shopName}".

Business data (last 30 days):
- Total Products: ${products.length}
- Monthly Revenue: Rs ${totalRevenue}
- Monthly Expenses: Rs ${totalExpenses}
- Monthly Profit: Rs ${profit}
- Total Bills: ${recentSales.length}
- Products: ${JSON.stringify(productSummary)}

User Question: "${question}"

Provide a helpful, concise answer (2-4 sentences). Be practical. No markdown.`;

    const answer = await generateAIResponse(prompt);
    res.json({ question, answer });
  } catch (error) {
    res.status(500).json({ message: "AI service error", error: error.message });
  }
};

// AI Stock Predictions
const getStockPredictions = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id });
    const recentSales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    });

    const salesVelocity = {};
    recentSales.forEach((sale) => {
      sale.items.forEach((item) => {
        salesVelocity[item.productName] =
          (salesVelocity[item.productName] || 0) + item.quantity;
      });
    });

    const predictions = products.map((product) => {
      const soldIn14Days = salesVelocity[product.name] || 0;
      const dailyRate = soldIn14Days / 14;
      const daysUntilStockOut =
        dailyRate > 0 ? Math.floor(product.quantity / dailyRate) : null;

      return {
        name: product.name,
        currentStock: product.quantity,
        dailySalesRate: Math.round(dailyRate * 10) / 10,
        daysUntilStockOut,
        status:
          daysUntilStockOut === null
            ? "no-sales"
            : daysUntilStockOut <= 3
              ? "critical"
              : daysUntilStockOut <= 7
                ? "warning"
                : "healthy",
      };
    });

    const sorted = predictions.sort((a, b) => {
      if (a.daysUntilStockOut === null) return 1;
      if (b.daysUntilStockOut === null) return -1;
      return a.daysUntilStockOut - b.daysUntilStockOut;
    });

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// AI Product Category Suggestion
const suggestCategory = async (req, res) => {
  try {
    const { productName } = req.body;
    if (!productName)
      return res.status(400).json({ message: "Product name is required" });

    const prompt = `Given the product name "${productName}", suggest the most appropriate category from: [Grocery, Dairy, Beverages, Snacks, Personal Care, Household, Electronics, Stationery, Clothing, Medicine, Vegetables, Fruits, Bakery, Frozen Food, General]. Return ONLY the category name, nothing else.`;

    const category = await generateAIResponse(prompt);
    res.json({ productName, suggestedCategory: category.trim() });
  } catch (error) {
    res.status(500).json({ message: "AI service error", error: error.message });
  }
};

// Smart Billing - Suggest products based on customer history
const getCustomerSuggestions = async (req, res) => {
  try {
    const { customerName } = req.query;
    if (!customerName) return res.json({ suggestions: [] });

    // Find past purchases by this customer
    const pastSales = await Sale.find({
      owner: req.user._id,
      customerName: { $regex: customerName, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    if (pastSales.length === 0)
      return res.json({ suggestions: [], message: "New customer" });

    // Get frequently bought products
    const productCount = {};
    pastSales.forEach((sale) => {
      sale.items.forEach((item) => {
        productCount[item.productName] =
          (productCount[item.productName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, timesBought: count }));

    res.json({
      suggestions: topProducts,
      totalVisits: pastSales.length,
      lastVisit: pastSales[0]?.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// AI Price Advisor
const suggestPrice = async (req, res) => {
  try {
    const { productName, purchasePrice, category } = req.body;
    if (!productName || !purchasePrice)
      return res
        .status(400)
        .json({ message: "Product name and purchase price required" });

    const prompt = `You are a pricing advisor for a retail shop in India. 
Product: "${productName}" 
Category: ${category || "General"}
Purchase/Cost Price: Rs ${purchasePrice}

Suggest the optimal selling price. Consider:
- Standard retail margins for this category (typically 10-40%)
- Indian market pricing norms

Reply in this exact format only (no other text):
PRICE: [number]
MARGIN: [percentage]
REASON: [one short sentence]`;

    const response = await generateAIResponse(prompt);

    // Parse AI response
    const priceMatch = response.match(/PRICE:\s*(\d+)/);
    const marginMatch = response.match(/MARGIN:\s*(\d+)/);
    const reasonMatch = response.match(/REASON:\s*(.+)/);

    res.json({
      suggestedPrice: priceMatch
        ? parseInt(priceMatch[1])
        : Math.round(purchasePrice * 1.2),
      margin: marginMatch ? marginMatch[1] + "%" : "20%",
      reason: reasonMatch
        ? reasonMatch[1].trim()
        : "Standard retail margin applied",
    });
  } catch (error) {
    res.status(500).json({ message: "AI service error", error: error.message });
  }
};

// AI Daily Report
const generateDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Today's data
    const todaySales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: today },
    });
    const yesterdaySales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: yesterday, $lt: today },
    });
    const weekSales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: lastWeek },
    });

    const products = await Product.find({ owner: req.user._id });
    const lowStock = products.filter((p) => p.quantity <= p.minStockLevel);

    const todayRevenue = todaySales.reduce(
      (s, sale) => s + sale.totalAmount,
      0,
    );
    const yesterdayRevenue = yesterdaySales.reduce(
      (s, sale) => s + sale.totalAmount,
      0,
    );
    const weekRevenue = weekSales.reduce((s, sale) => s + sale.totalAmount, 0);

    // Top products this week
    const weekProductMap = {};
    weekSales.forEach((sale) => {
      sale.items.forEach((item) => {
        weekProductMap[item.productName] =
          (weekProductMap[item.productName] || 0) + item.quantity;
      });
    });
    const topWeekProducts = Object.entries(weekProductMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const prompt = `You are a business report writer for a ${req.user.shopType} shop named "${req.user.shopName}".

Write a professional daily business report based on this data:

TODAY:
- Revenue: Rs ${todayRevenue} from ${todaySales.length} bills

YESTERDAY:
- Revenue: Rs ${yesterdayRevenue} from ${yesterdaySales.length} bills

THIS WEEK (7 days):
- Total Revenue: Rs ${weekRevenue} from ${weekSales.length} bills
- Top Products: ${topWeekProducts.map(([n, q]) => n + " (" + q + " sold)").join(", ") || "No data"}

INVENTORY:
- Total Products: ${products.length}
- Low Stock Items: ${lowStock.length} (${lowStock.map((p) => p.name).join(", ") || "None"})
- Total Stock Value: Rs ${products.reduce((s, p) => s + p.quantity * p.purchasePrice, 0)}

Write a complete daily report with sections: Summary, Performance, Alerts, and Recommendations. Keep it concise (6-8 sentences total). No markdown formatting.`;

    const report = await generateAIResponse(prompt);

    res.json({
      report,
      data: {
        todayRevenue,
        todayBills: todaySales.length,
        yesterdayRevenue,
        weekRevenue,
        weekBills: weekSales.length,
        lowStockCount: lowStock.length,
        topProducts: topWeekProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "AI service error", error: error.message });
  }
};

module.exports = {
  getDashboardInsights,
  askAiAssistant,
  getStockPredictions,
  suggestCategory,
  getCustomerSuggestions,
  suggestPrice,
  generateDailyReport,
};
