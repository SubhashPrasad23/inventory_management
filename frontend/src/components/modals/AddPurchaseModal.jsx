import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineX } from "react-icons/hi";
import API from "../../api/axios";
import toast from "react-hot-toast";

const AddPurchaseModal = ({ onClose, onAdded }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplierName: "",
    items: [{ productId: "", productName: "", quantity: "", price: "" }],
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch {}
    };
    fetchProducts();
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", productName: "", quantity: "", price: "" }],
    });
  };

  const updateItem = (index, field, value) => {
    const updated = formData.items.map((item, i) => {
      if (i === index) {
        if (field === "productId") {
          const selected = products.find((p) => p._id === value);
          return { ...item, productId: value, productName: selected?.name || "", price: selected?.purchasePrice || "" };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({ ...formData, items: updated });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/purchases", formData);
      toast.success("Purchase recorded! Stock updated.");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add purchase");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <HiOutlineX className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Record Purchase</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Name *</label>
            <input
              type="text"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className="input-field"
              placeholder="Supplier name"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Items</label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  className="input-field flex-1"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className="input-field w-24"
                  placeholder="Qty"
                  required
                  min={1}
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  className="input-field w-28"
                  placeholder="₹ Price"
                  required
                  min={0}
                />
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="btn-danger px-3">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:underline mt-1">
              + Add another item
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Optional notes"
            />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
    , document.body
  );
};

export default AddPurchaseModal;
