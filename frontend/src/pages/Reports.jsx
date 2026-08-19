import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Loading from "../components/Loading";
import API from "../api/axios";

const Reports = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [aiReport, setAiReport] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [productsRes, predictionsRes] = await Promise.all([
        API.get("/products"),
        API.get("/ai/predictions").catch(() => ({ data: [] })),
      ]);
      setProducts(productsRes.data);
      setPredictions(predictionsRes.data || []);
    } catch (error) {
      console.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const { data } = await API.get("/ai/daily-report");
      setAiReport(data.report);
    } catch (error) {
      setAiReport("Could not generate report. Please try again later.");
    } finally {
      setReportLoading(false);
    }
  };

  // Category breakdown
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find((item) => item.name === product.category);
    if (existing) existing.value += 1;
    else acc.push({ name: product.category, value: 1 });
    return acc;
  }, []);

  // Stock value by category
  const stockValueData = products.reduce((acc, product) => {
    const existing = acc.find((item) => item.name === product.category);
    const value = product.quantity * product.purchasePrice;
    if (existing) existing.value += value;
    else acc.push({ name: product.category, value });
    return acc;
  }, []);

  const COLORS = ["#0d9488", "#0284c7", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Reports & Analytics</h1>
        <button onClick={generateReport} disabled={reportLoading} className="btn-primary text-xs disabled:opacity-50">
          {reportLoading ? "Generating..." : "Generate AI Report"}
        </button>
      </div>

      {/* AI Report */}
      {(aiReport || reportLoading) && (
        <div className="card p-5 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">AI Daily Report</h3>
          {reportLoading ? (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              Generating report with AI...
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiReport}</p>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Stock Value by Category</h3>
          {stockValueData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Add products to see charts</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Products by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Add products to see chart</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {categoryData.map((item, index) => (
                  <span key={item.name} className="text-[10px] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Stock Predictions */}
      {predictions.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">AI Stock Predictions</h3>
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Daily Rate</th>
                  <th className="pb-2 font-medium">Days Left</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 10).map((item) => (
                  <tr key={item.name} className={`border-b border-gray-50 ${item.currentStock === 0 ? "bg-red-50" : ""}`}>
                    <td className={`py-2 font-medium text-xs ${item.currentStock === 0 ? "text-red-700" : "text-gray-800"}`}>{item.name}</td>
                    <td className={`py-2 text-xs font-semibold ${item.currentStock === 0 ? "text-red-600" : ""}`}>{item.currentStock === 0 ? "0" : item.currentStock}</td>
                    <td className="py-2 text-xs">{item.dailySalesRate}/day</td>
                    <td className="py-2 text-xs font-semibold">{item.daysUntilStockOut !== null ? `${item.daysUntilStockOut} days` : "-"}</td>
                    <td className="py-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        item.currentStock === 0 ? "bg-red-600 text-white" :
                        item.status === "critical" ? "bg-red-100 text-red-700" :
                        item.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                        item.status === "healthy" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{item.currentStock === 0 ? "OUT OF STOCK" : item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
