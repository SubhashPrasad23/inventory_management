import { useState } from "react";
import useAuthStore from "../store/authStore";
import API from "../api/axios";
import toast from "react-hot-toast";
import { PLANS } from "../utils/data";

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    shopName: user?.shopName || "",
    shopType: user?.shopType || "retailer",
    phone: user?.phone || "",
    address: user?.address || "",
    gstNumber: user?.gstNumber || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put("/auth/profile", formData);
      setUser({ ...user, ...data });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      const { data } = await API.put("/auth/upgrade-plan", { plan });
      setUser({ ...user, plan: data.user.plan });
      toast.success(`Plan upgraded to ${plan}!`);
    } catch (error) {
      toast.error("Failed to upgrade plan");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="page-title">Settings</h1>

      {/* Profile*/}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Shop Profile</h2>
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Your Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Shop Name</label>
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Shop Type</label>
            <select
              value={formData.shopType}
              onChange={(e) => setFormData({ ...formData, shopType: e.target.value })}
              className="input-field"
            >
              <option value="retailer">Retailer</option>
              <option value="wholesaler">Wholesaler</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              placeholder="Shop address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="input-field"
              placeholder="GST number (optional)"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Subscription Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card p-5 border-2 ${plan.color} ${user?.plan === plan.name ? "ring-2 ring-indigo-500" : ""}`}
            >
              {plan.popular && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-800 mt-2">{plan.title}</h3>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
              {user?.plan === plan.name ? (
                <span className="block mt-4 text-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg py-2">
                  Current Plan
                </span>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className="btn-primary w-full mt-4 text-sm"
                >
                  {plan.name === "starter" ? "Downgrade" : "Upgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
