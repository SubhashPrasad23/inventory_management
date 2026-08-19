import { useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineX } from "react-icons/hi";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "../../utils/data";

const EditProductModal = ({ product, onClose, onUpdated }) => {
  const [editData, setEditData] = useState({
    name: product.name,
    barcode: product.barcode || "",
    category: product.category,
    purchasePrice: product.purchasePrice,
    salePrice: product.salePrice,
    quantity: product.quantity,
    unit: product.unit,
    minStockLevel: product.minStockLevel,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/products/${product._id}`, editData);
      toast.success("Product updated!");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <HiOutlineX className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
            <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="input-field">
                {PRODUCT_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <select value={editData.unit} onChange={(e) => setEditData({ ...editData, unit: e.target.value })} className="input-field">
                {PRODUCT_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price *</label>
              <input type="number" value={editData.purchasePrice} onChange={(e) => setEditData({ ...editData, purchasePrice: e.target.value })} className="input-field" required min={0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price *</label>
              <input type="number" value={editData.salePrice} onChange={(e) => setEditData({ ...editData, salePrice: e.target.value })} className="input-field" required min={0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
              <input type="number" value={editData.quantity} onChange={(e) => setEditData({ ...editData, quantity: e.target.value })} className="input-field" required min={0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Stock Level</label>
              <input type="number" value={editData.minStockLevel} onChange={(e) => setEditData({ ...editData, minStockLevel: e.target.value })} className="input-field" min={0} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Barcode</label>
            <input type="text" value={editData.barcode} onChange={(e) => setEditData({ ...editData, barcode: e.target.value })} className="input-field" placeholder="Optional" />
          </div>

          {editData.purchasePrice && editData.salePrice && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-center">
              <span className="text-xs text-teal-800 font-medium">
                Margin: ₹{(editData.salePrice - editData.purchasePrice).toFixed(2)} ({((editData.salePrice - editData.purchasePrice) / editData.purchasePrice * 100).toFixed(1)}%)
              </span>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
    , document.body
  );
};

export default EditProductModal;
