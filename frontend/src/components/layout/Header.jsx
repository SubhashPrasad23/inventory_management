import { useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between flex-1 ml-2 lg:ml-0 ">
      <div className="hidden sm:block">
        <h2 className="text-sm font-semibold text-gray-800">{user?.shopName}</h2>
        <p className="text-[11px] text-gray-400 capitalize">{user?.shopType}</p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <span className={`hidden sm:inline text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide ${
          user?.plan === "pro" 
            ? "bg-teal-100 text-teal-800" 
            : user?.plan === "business" 
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-600"
        }`}>
          {user?.plan}
        </span>

        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Logout"
        >
          <HiOutlineLogout className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default Header;
