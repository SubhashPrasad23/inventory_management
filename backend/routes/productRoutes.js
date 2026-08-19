const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { checkProductLimit } = require("../middleware/planLimits");
const {
  getProducts,
  getProductById,
  getProductByBarcode,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController");

router.get("/", protect, getProducts);
router.get("/search", protect, searchProducts);
router.get("/low-stock", protect, getLowStockProducts);
router.get("/barcode/:barcode", protect, getProductByBarcode);
router.get("/:id", protect, getProductById);
router.post("/", protect, checkProductLimit, addProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
