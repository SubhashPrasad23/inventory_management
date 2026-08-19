import { useState, useEffect } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import Loading from "../components/Loading";
import AddPurchaseModal from "../components/modals/AddPurchaseModal";
import PurchaseDetailModal from "../components/modals/PurchaseDetailModal";
import API from "../api/axios";
import toast from "react-hot-toast";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data } = await API.get("/purchases");
      setPurchases(data.purchases || []);
    } catch {
      toast.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const getAiPurchaseSuggestion = async () => {
    setSuggestLoading(true);
    try {
      const { data } = await API.post("/ai/ask", {
        question: "Based on my current stock levels and sales patterns, what products should I purchase/restock next? Also suggest any trending products I should consider adding to my inventory. Be specific with product names and quantities."
      });
      setAiSuggestion(data.answer);
    } catch {
      setAiSuggestion("Could not get suggestions right now. Try again later.");
    } finally {
      setSuggestLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Purchases</h1>
        <div className="flex gap-2">
          <button onClick={getAiPurchaseSuggestion} disabled={suggestLoading} className="btn-secondary text-xs flex items-center gap-1 disabled:opacity-50">
            {suggestLoading ? "Thinking..." : "AI Suggest"}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <HiOutlinePlus className="w-4 h-4" />
            Add Purchase
          </button>
        </div>
      </div>

      {/* AI restock suggestion */}
      {aiSuggestion && (
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <span className="text-sm">🤖</span>
            <div>
              <p className="text-xs font-semibold text-blue-800 mb-1">AI Purchase Suggestion</p>
              <p className="text-xs text-gray-700 leading-relaxed">{aiSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      {purchases.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No purchases recorded yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr className="text-left text-gray-600 text-xs">
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPurchase(purchase)}>
                    <td className="px-4 py-3 font-medium text-gray-800">{purchase.supplierName}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{purchase.items?.length} items</td>
                    <td className="px-4 py-3 font-semibold text-teal-700">₹{purchase.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(purchase.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">{purchase.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {showForm && (
        <AddPurchaseModal onClose={() => setShowForm(false)} onAdded={fetchPurchases} />
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <PurchaseDetailModal purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />
      )}
    </div>
  );
};

export default Purchases;
