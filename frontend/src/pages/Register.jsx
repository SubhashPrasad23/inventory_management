import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import API from "../api/axios";
import toast from "react-hot-toast";
import logoImg from "../assets/icons/logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    shopName: "",
    shopType: "retailer",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", formData);
      setUser(data); 
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side -info */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1d23] items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-4 mb-8">
            <img src={logoImg} alt="Smart Dukan" className="w-14 h-14 rounded-xl object-cover" />
            <h1 className="text-4xl font-bold text-white">Smart Dukan</h1>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            Join thousands of shop owners who manage their inventory smarter with AI-powered tools.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-gray-400">Active Shops</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-xs text-gray-400">Bills Generated</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-gray-400">Uptime</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-2xl font-bold text-teal-400">AI</p>
              <p className="text-xs text-gray-400">Powered Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f2f5]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-3 mb-2">
              <img src={logoImg} alt="Smart Dukan" className="w-11 h-11 rounded-lg object-cover" />
              <h1 className="text-xl font-bold text-gray-900">Smart Dukan</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">Get started with your shop in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="input-field"
                placeholder="My Store"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Type</label>
              <select
                name="shopType"
                value={formData.shopType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
