import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineX, HiOutlineCamera, HiOutlineUpload, HiOutlineQrcode } from "react-icons/hi";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BrowserMultiFormatReader } from "@zxing/browser";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "../../utils/data";

const AddProductModal = ({ onClose, onAdded }) => {
  const [scanMode, setScanMode] = useState("camera");
  const [showScanner, setShowScanner] = useState(false);
  const [hardwareScanActive, setHardwareScanActive] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    brand: "",
    category: "General",
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    unit: "pcs",
    minStockLevel: 5,
    expiryDate: "",
  });

  // Camera Scanner
  useEffect(() => {
    if (showScanner && scanMode === "camera") {
      const scanner = new Html5QrcodeScanner("add-product-scanner-modal", {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        videoConstraints: {
          facingMode: "environment",
        },
      });
      scanner.render(
        (decodedText) => {
          setFormData((prev) => ({ ...prev, barcode: decodedText }));
          toast.success(`Barcode detected: ${decodedText}`);
          scanner.clear();
          setShowScanner(false);
          fetchProductByBarcode(decodedText);
        },
        () => {}
      );
      scannerRef.current = scanner;
      return () => { try { scannerRef.current?.clear(); } catch {} };
    }
  }, [showScanner, scanMode]);

  useEffect(() => {
    if (hardwareScanActive) {
      let barcode = "";
      let timeout = null;

      const handleKeyDown = (e) => {
        if (timeout) clearTimeout(timeout);
        if (e.key === "Enter" && barcode.length > 3) {
          setFormData((prev) => ({ ...prev, barcode }));
          toast.success(`Barcode detected: ${barcode}`);
          fetchProductByBarcode(barcode);
          barcode = "";
          return;
        }
        if (e.key.length === 1) barcode += e.key;
        timeout = setTimeout(() => { barcode = ""; }, 100);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [hardwareScanActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.expiryDate) delete payload.expiryDate;
      if (!payload.barcode) delete payload.barcode;
      await API.post("/products", payload);
      toast.success("Product added!");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductByBarcode = async (barcode) => {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const productName = data.product.product_name || data.product.product_name_en || "";
        const brand = data.product.brands || "";
        const category = data.product.categories_tags?.[0]?.replace("en:", "") || "";
        if (productName) {
          setFormData((prev) => ({ ...prev, name: productName, brand, category: category || prev.category }));
          toast.success(`Product found: ${brand ? brand + " " : ""}${productName}`);
        } else {
          toast("Product not in database. Enter name manually.", { icon: "ℹ️" });
        }
      } else {
        toast("Product not in database. Enter name manually.", { icon: "ℹ️" });
      }
    } catch {}
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    try {
      const zxingReader = new BrowserMultiFormatReader();
      const result = await zxingReader.decodeFromImageUrl(imageUrl);
      const code = result.getText();
      setFormData((prev) => ({ ...prev, barcode: code }));
      toast.success(`Barcode detected: ${code}`);
      await fetchProductByBarcode(code);
    } catch {
      toast.error("Could not detect barcode. Try a clearer image.");
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-[9999] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-lg h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <HiOutlineX className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Product</h2>

        {/* Scan Mode Tabs */}
        <div className="flex gap-1 mb-5 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => { setScanMode("camera"); setShowScanner(true); setHardwareScanActive(false); }}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-md text-[11px] sm:text-xs font-medium transition ${scanMode === "camera" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
          >
            <HiOutlineCamera className="w-3.5 h-3.5" /> <span>Scan Barcode</span>
          </button>
          <button
            type="button"
            onClick={() => { setScanMode("upload"); setShowScanner(false); setHardwareScanActive(false); }}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-md text-[11px] sm:text-xs font-medium transition ${scanMode === "upload" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
          >
            <HiOutlineUpload className="w-3.5 h-3.5" /> <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => { setScanMode("hardware"); setShowScanner(false); setHardwareScanActive(true); }}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-md text-[11px] sm:text-xs font-medium transition ${scanMode === "hardware" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
          >
            <HiOutlineQrcode className="w-3.5 h-3.5" /> <span>Barcode Gun</span>
          </button>
        </div>

        {/* Camera Scanner */}
        {showScanner && scanMode === "camera" && (
          <div className="mb-5 border-2 border-dashed border-teal-200 rounded-lg p-3 bg-teal-50/30">
            <p className="text-xs text-gray-500 mb-2 text-center">Point camera at barcode</p>
            <div id="add-product-scanner-modal"></div>
            {formData.barcode && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
                <span className="text-xs text-green-700 font-medium">Captured: {formData.barcode}</span>
              </div>
            )}
          </div>
        )}

        {/* Image Upload */}
        {scanMode === "upload" && (
          <div className="mb-5 border-2 border-dashed border-teal-200 rounded-lg p-4 bg-teal-50/30 text-center">
            <HiOutlineUpload className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-3">Upload a barcode image</p>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs">Choose Image</button>
            {formData.barcode && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-xs text-green-700 font-medium">Detected: {formData.barcode}</span>
              </div>
            )}
          </div>
        )}

        {/* Barcode Gun Mode */}
        {scanMode === "hardware" && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <HiOutlineQrcode className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Barcode Gun Active</p>
            <p className="text-xs text-green-600">Scan product barcode — it will auto-fill details</p>
            {formData.barcode && (
              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
                <span className="text-xs text-green-800 font-medium">Scanned: {formData.barcode}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Barcode</label>
              <input type="text" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} className={`input-field ${formData.barcode ? "bg-green-50 border-green-200" : ""}`} placeholder="Scan or type" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="input-field" placeholder="Brand name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g., Tata Salt 1kg" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                {PRODUCT_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="input-field">
                {PRODUCT_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price *</label>
              <input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="input-field" required min={0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price *</label>
              <input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="input-field" required min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="input-field" required min={0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="input-field" />
            </div>
          </div>

          {formData.purchasePrice && formData.salePrice && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5 text-center">
              <span className="text-xs text-teal-800 font-medium">
                Margin: ₹{(formData.salePrice - formData.purchasePrice).toFixed(2)} ({((formData.salePrice - formData.purchasePrice) / formData.purchasePrice * 100).toFixed(1)}%)
              </span>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Adding..." : "Add Product"}</button>
          </div>
        </form>
      </div>
    </div>
    , document.body
  );
};

export default AddProductModal;
