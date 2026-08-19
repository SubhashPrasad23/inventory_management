const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomerById);
router.post("/", protect, addCustomer);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;
