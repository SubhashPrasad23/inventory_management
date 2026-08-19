import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AiAssistant from "../AiAssistant";
import { HiOutlineMenu } from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import API from "../../api/axios";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        const existing = JSON.parse(localStorage.getItem("userInfo"));
        if (existing) {
          setUser({ ...existing, ...data, token: existing.token });
        }
      } catch (err) {
        console.error(err)
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar*/}
      <div className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[250px] min-w-0 overflow-x-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <HiOutlineMenu className="w-5 h-5" />
          </button>
          <Header />
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      <AiAssistant />
      </div>
    </div>
  );
};

export default AppLayout;
