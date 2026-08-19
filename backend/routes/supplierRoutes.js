const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplierById);
router.post("/", protect, addSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);

module.exports = router;
