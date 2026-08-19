import { useState, useEffect } from "react";
import { HiOutlineTrash, HiOutlinePlus, HiOutlineQrcode } from "react-icons/hi";
import BarcodeScanner from "../components/BarcodeScanner";
import API from "../api/axios";
import toast from "react-hot-toast";

const Billing = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [items, setItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [scannerMode, setScannerMode] = useState("search");
  const [hardwareScanActive, setHardwareScanActive] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);

  const fetchCustomerSuggestions = async (name) => {
    if (name.length < 3) { setCustomerSuggestions([]); return; }
    try {
      const { data } = await API.get(`/ai/customer-suggestions?customerName=${name}`);
      setCustomerSuggestions(data.suggestions || []);
    } catch (err) {
      setCustomerSuggestions([]);
    }
  };

  // Add suggested product to bill
  const addSuggestedProduct = async (productName) => {
    try {
      const { data } = await API.get(`/products/search?query=${productName}`);
      if (data.length > 0) {
        addItemToList(data[0]);
        toast.success(`Added: ${data[0].name}`);
      }
    } catch (err) {
      toast.error("Could not add product");
    }
  };

  // barcode scanner listener
  useEffect(() => {
    if (hardwareScanActive) {
      let barcode = "";
      let timeout = null;

      const handleKeyDown = (e) => {
        if (timeout) clearTimeout(timeout);
        if (e.key === "Enter" && barcode.length > 3) {
          handleBarcodeScan(barcode);
          barcode = "";
          return;
        }
        if (e.key.length === 1) barcode += e.key;
        timeout = setTimeout(() => { barcode = ""; }, 100);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [hardwareScanActive, items]);

  
  const handleBarcodeScan = async (code) => {
    try {
      const { data } = await API.get(`/products/barcode/${code}`);
      if (data) {
        addItemToList(data);
        toast.success(`Added: ${data.name}`);
      }
    } catch (error) {
      toast.error(`Product not found for barcode: ${code}`);
    }
  };

  const addItemToList = (product) => {
    if (product.quantity <= 0) {
      toast.error(`${product.name} is OUT OF STOCK!`, { position: "top-center" });
      return;
    }
    const existing = items.find((item) => item.productId === product._id);
    if (existing) {
      setItems(items.map((item) =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1, itemTotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setItems([...items, {
        productId: product._id,
        productName: product.name,
        price: product.salePrice,
        quantity: 1,
        itemTotal: product.salePrice,
        availableStock: product.quantity,
      }]);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const { data } = await API.get(`/products/search?query=${query}`);
      setSearchResults(data);

      // if no results found, try a broader search (remove last char - handles typos)
      if (data.length === 0 && query.length > 3) {
        const fuzzy = query.slice(0, -1); // drop last char as possible typo
        const { data: retry } = await API.get(`/products/search?query=${fuzzy}`);
        setSearchResults(retry);
      }
    } catch (err) {
      setSearchResults([]);
    }
  };

  const updateItemQuantity = (index, quantity) => {
    const qty = parseInt(quantity) || 0;
    setItems(items.map((item, i) => i === index ? { ...item, quantity: qty, itemTotal: qty * item.price } : item));
  };

  const updateItemPrice = (index, price) => {
    const p = parseFloat(price) || 0;
    setItems(items.map((item, i) => i === index ? { ...item, price: p, itemTotal: item.quantity * p } : item));
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const calculateTotal = () => items.reduce((sum, item) => sum + item.itemTotal, 0);

  const handleSubmitBill = async () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return; }
    if (items.length === 0) { toast.error("Add at least one product"); return; }

    setSubmitting(true);
    try {
      const billData = {
        customerName, customerPhone, customerAddress,
        items: items.map((item) => ({ productId: item.productId, productName: item.productName, quantity: item.quantity, price: item.price })),
        paymentMode, discount, note,
      };
      const { data } = await API.post("/sales", billData);
      toast.success(`Bill created! Invoice: ${data.invoiceNumber}`);
      setCustomerName(""); setCustomerPhone(""); setCustomerAddress("");
      setItems([]); setPaymentMode("cash");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create bill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="page-title">Create Bill</h1>
      <div className="card p-4">
        <div className="flex gap-2 mb-3 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => { setScannerMode("search"); setHardwareScanActive(false); }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition ${scannerMode === "search" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
          >
            Search Product
          </button>
          <button
            onClick={() => { setScannerMode("scan"); setHardwareScanActive(false); }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition ${scannerMode === "scan" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
          >
            Scan Barcode
          </button>
          <button
            onClick={() => { setScannerMode("hardware"); setHardwareScanActive(true); }}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition ${scannerMode === "hardware" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
          >
            Barcode Gun
          </button>
        </div>

        {/* Search */}
        {scannerMode === "search" && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field"
              placeholder="Type product name to search..."
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-20 max-h-48 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => { if (product.quantity > 0) { addItemToList(product); setSearchQuery(""); setSearchResults([]); } else { toast.error(`${product.name} is OUT OF STOCK!`, { position: "top-center" }); } }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category} | Stock: {product.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-teal-700">&#8377;{product.salePrice}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scan mode*/}
        {scannerMode === "scan" && (
          <BarcodeScanner onScan={handleBarcodeScan} id="billing-scanner" />
        )}

        {/* barcode gun scanner mode */}
        {scannerMode === "hardware" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <HiOutlineQrcode className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Barcode Gun Active</p>
            <p className="text-xs text-green-600">Scan products — they add to bill automatically</p>
          </div>
        )}
      </div>

      {/* Bill Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 card p-4 md:p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Items ({items.length})</h3>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <HiOutlinePlus className="w-7 h-7 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Search, scan, or use barcode gun to add products</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b text-xs">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Total</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-50">
                      <td className="py-2 text-gray-400 text-xs">{index + 1}</td>
                      <td className="py-2 font-medium text-gray-800 text-xs md:text-sm">{item.productName}</td>
                      <td className="py-2">
                        <input type="number" value={item.price} onChange={(e) => updateItemPrice(index, e.target.value)} className="w-16 md:w-20 px-2 py-1 border border-gray-200 rounded text-xs" />
                      </td>
                      <td className="py-2">
                        <input type="number" min={1} max={item.availableStock} value={item.quantity} onChange={(e) => updateItemQuantity(index, e.target.value)} className="w-14 md:w-16 px-2 py-1 border border-gray-200 rounded text-xs" />
                      </td>
                      <td className="py-2 font-semibold text-xs md:text-sm">&#8377;{item.itemTotal.toFixed(2)}</td>
                      <td className="py-2">
                        <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-teal-700">&#8377;{calculateTotal().toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Customer + Payment */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3">Customer</h3>
            <div className="space-y-2">
              <input type="text" value={customerName} onChange={(e) => { setCustomerName(e.target.value); fetchCustomerSuggestions(e.target.value); }} className="input-field text-sm" placeholder="Name *" />
              <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input-field text-sm" placeholder="Phone" />
              <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="input-field text-sm" placeholder="Address" />
            </div>
            {/* AI Customer Suggestions */}
            {customerSuggestions.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-[10px] font-semibold text-blue-700 mb-2">AI: This customer usually buys:</p>
                <div className="flex flex-wrap gap-1">
                  {customerSuggestions.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => addSuggestedProduct(item.name)}
                      className="text-[10px] px-2 py-1 bg-white border border-blue-200 rounded-full text-blue-700 hover:bg-blue-100 transition"
                    >
                      + {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3">Discount & Note</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="input-field text-sm w-20"
                  placeholder="0"
                />
                <span className="text-xs text-gray-500">% discount</span>
                {discount > 0 && (
                  <span className="text-xs text-red-500 ml-auto">-&#8377;{(calculateTotal() * discount / 100).toFixed(2)}</span>
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field text-sm resize-none"
                rows={2}
                placeholder="Add a note (optional)"
              />
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3">Payment</h3>
            <div className="flex gap-2">
              <button onClick={() => setPaymentMode("cash")} className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition ${paymentMode === "cash" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-500"}`}>Cash</button>
              <button onClick={() => setPaymentMode("online")} className={`flex-1 py-2 rounded-lg text-xs font-medium border-2 transition ${paymentMode === "online" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-500"}`}>Online</button>
            </div>
          </div>

          {/* Final Amount */}
          {items.length > 0 && discount > 0 && (
            <div className="card p-4 bg-teal-50 border-teal-200">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Subtotal</span>
                <span>&#8377;{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-red-500 mb-1">
                <span>Discount ({discount}%)</span>
                <span>-&#8377;{(calculateTotal() * discount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-teal-800 pt-1 border-t border-teal-200">
                <span>Final Amount</span>
                <span>&#8377;{(calculateTotal() - calculateTotal() * discount / 100).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitBill}
            disabled={submitting || items.length === 0}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
          >
            {submitting ? "Processing..." : `Complete Bill — ₹${(calculateTotal() - calculateTotal() * discount / 100).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
