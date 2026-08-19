import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import API from "../api/axios";
import useAuthStore from "../store/authStore";
import Loading from "../components/Loading";
import aiIcon from "../assets/icons/aiassistant.png";


const Dashboard = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayRes, productsRes, salesRes] = await Promise.all([
        API.get("/sales/today"),
        API.get("/products/low-stock"),
        API.get("/sales?limit=5"),
      ]);

      setMetrics(todayRes.data);
      setLowStock(productsRes.data);
      setRecentSales(salesRes.data.sales || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch ai insights 
  const fetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const { data } = await API.get("/ai/insights");
      setAiInsight(data.summary);
    } catch (error) {
      setAiInsight("AI insights unavailable at the moment.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsights();
  }, []);

  const buildChartData = () => {
    if (!recentSales || recentSales.length === 0) {
      return [
        { name: "Mon", sales: 0 },
        { name: "Tue", sales: 0 },
        { name: "Wed", sales: 0 },
        { name: "Thu", sales: 0 },
        { name: "Fri", sales: 0 },
        { name: "Sat", sales: 0 },
        { name: "Sun", sales: 0 },
      ];
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const salesByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    recentSales.forEach((sale) => {
      const day = days[new Date(sale.createdAt).getDay()];
      salesByDay[day] += sale.totalAmount;
    });

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
      name: d,
      sales: salesByDay[d],
    }));
  };

  const chartData = buildChartData();

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${metrics?.totalRevenue?.toLocaleString() || 0}`,
    },
    {
      title: "Today's Bills",
      value: metrics?.totalBills || 0,
    },
    {
      title: "Items Sold Today",
      value: metrics?.totalItems || 0,
    },
    {
      title: "Low Stock Alerts",
      value: lowStock?.length || 0,
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-sm text-slate-400">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* AI Insight Card */}
      {(aiInsight || aiLoading) && (
        <div className="card p-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center flex-shrink-0">
              <img src={aiIcon} alt="Dukan AI" className="w-9 h-9 rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-indigo-700 mb-1">AI Business Insight</h3>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  Analyzing your business data...
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">{aiInsight || "Loading insights..."}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Banner for Starter */}
      {user?.plan === "starter" && (
        <div className="card p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Unlock AI-Powered Insights</h3>
              <p className="text-xs text-amber-600">Upgrade to Business plan to get AI predictions, smart alerts, and more.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Weekly Sales Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">All products are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 8).map((product) => (
                <div key={product._id} className={`flex items-center gap-3 py-2 border-b ${product.quantity === 0 ? "bg-red-50 border-red-100 -mx-2 px-2 rounded" : "border-slate-50"}`}>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${product.quantity === 0 ? "text-red-700" : "text-slate-700"}`}>{product.name}</p>
                    <p className="text-xs text-slate-400 truncate">{product.category}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                    product.quantity === 0 ? "bg-red-600 text-white" : "bg-amber-100 text-amber-700"
                  }`}>
                    {product.quantity === 0 ? "OUT OF STOCK" : `${product.quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Recent Sales</h3>
        {recentSales.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No sales yet. Create your first bill!</p>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="border-b border-slate-50">
                    <td className="py-3 font-mono text-xs text-indigo-600">{sale.invoiceNumber}</td>
                    <td className="py-3">{sale.customerName}</td>
                    <td className="py-3">{sale.items?.length} items</td>
                    <td className="py-3 font-semibold">₹{sale.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 text-slate-400">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
