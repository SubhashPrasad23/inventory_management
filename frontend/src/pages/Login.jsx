import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import API from "../api/axios";
import toast from "react-hot-toast";
import logoImg from "../assets/icons/logo.png";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      setUser(data);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1d23] items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-4 mb-8">
            <img src={logoImg} alt="Smart Dukan" className="w-14 h-14 rounded-xl object-cover" />
            <h1 className="text-4xl font-bold text-white">Smart Dukan</h1>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            AI-powered inventory management system for modern retailers and wholesalers.
           .
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600/20 rounded-lg flex items-center justify-center">
                <span className="text-teal-400 text-xl"><IoCheckmarkDoneCircleSharp/></span>
              </div>
              <span className="text-gray-300 text-sm">AI-powered business analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600/20 rounded-lg flex items-center justify-center">
                <span className="text-teal-400 text-xl"><IoCheckmarkDoneCircleSharp /></span>
              </div>
              <span className="text-gray-300 text-sm">Scan barcodes with your phone camera</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600/20 rounded-lg flex items-center justify-center">
                <span className="text-teal-400 text-xl"><IoCheckmarkDoneCircleSharp /></span>
              </div>
              <span className="text-gray-300 text-sm">Generate professional PDF invoices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f2f5]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center justify-center">
            <div className="flex items-center gap-3 mb-2">
              <img src={logoImg} alt="Smart Dukan" className="w-11 h-11 rounded-lg object-cover" />
              <h1 className="text-xl font-bold text-gray-900">Smart Dukan</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to manage your inventory</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            {"Don't have an account? "}
            <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
