const Supplier = require("../models/Supplier");

// Get all suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single supplier
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add supplier
const addSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, company } = req.body;

    const supplier = await Supplier.create({
      name,
      phone: phone || "",
      email: email || "",
      address: address || "",
      company: company || "",
      owner: req.user._id,
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};
