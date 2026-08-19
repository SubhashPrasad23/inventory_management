const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    barcode: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      default: "pcs",
      enum: ["pcs", "kg", "ltr", "box", "pack", "dozen"],
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster barcode lookups
productSchema.index({ barcode: 1, owner: 1 });
productSchema.index({ name: "text" });

module.exports = mongoose.model("Product", productSchema);
