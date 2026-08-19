import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiOutlineX } from "react-icons/hi";
import API from "../../api/axios";
import toast from "react-hot-toast";

const ProductInput = ({ value, onChange, products, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value, null); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="input-field w-full"
        placeholder={placeholder}
        required
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.map((p) => (
            <li
              key={p._id}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => { onChange(p.name, p); setOpen(false); }}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
      } catch {
        // silently fail
      }
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
      if (i === index) return { ...item, [field]: value };
      return item;
    });
    setFormData({ ...formData, items: updated });
  };

  const handleProductSelect = (index, name, product) => {
    const updated = formData.items.map((item, i) => {
      if (i === index) {
        if (product) {
          return { ...item, productId: product._id, productName: name, price: product.purchasePrice || item.price };
        }
        return { ...item, productId: "", productName: name };
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-[9999] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
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
              <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-gray-500 mb-1">Product Name *</label>
                    <ProductInput
                      value={item.productName}
                      onChange={(name, product) => handleProductSelect(index, name, product)}
                      products={products}
                      placeholder="Type or select product"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <div className="flex items-end">
                      <button type="button" onClick={() => removeItem(index)} className="btn-danger px-3 h-[38px]">×</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="input-field w-full"
                      placeholder="Qty"
                      required
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Price *</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", e.target.value)}
                      className="input-field w-full"
                      placeholder="₹ Price"
                      required
                      min={0}
                    />
                  </div>
                </div>
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
