import { NavLink } from "react-router-dom";
import { 
  HiOutlineHome, 
  HiOutlineShoppingCart, 
  HiOutlineCube, 
  HiOutlineClipboardList,
  HiOutlineTruck,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineX
} from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import logoImg from "../../assets/icons/logo.png";

const Sidebar = ({ onClose }) => {
  const { user } = useAuthStore();

  const navItems = [
    { path: "/", icon: HiOutlineHome, label: "Dashboard" },
    { path: "/billing", icon: HiOutlineShoppingCart, label: "Billing" },
    { path: "/products", icon: HiOutlineCube, label: "Products" },
    { path: "/sales", icon: HiOutlineClipboardList, label: "Sales & Invoices" },
    { path: "/purchases", icon: HiOutlineTruck, label: "Purchases" },
    { path: "/customers", icon: HiOutlineUsers, label: "Customers" },
    { path: "/reports", icon: HiOutlineChartBar, label: "Reports", plan: "business" },
    { path: "/settings", icon: HiOutlineCog, label: "Settings" },
  ];

  const isAccessible = (item) => {
    if (!item.plan) return true;
    if (item.plan === "business") return user?.plan === "business" || user?.plan === "pro";
    if (item.plan === "pro") return user?.plan === "pro";
    return true;
  };

  return (
    <aside className="h-full w-[250px] bg-[#1a1d23] flex flex-col">
      
      <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Smart Dukan" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <h1 className="font-bold text-white text-base">Smart Dukan</h1>
            <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">{user?.plan || "starter"} plan</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-white">
          <HiOutlineX className="w-5 h-5" />
        </button>
      </div>

      {/* Menus */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-teal-600/15 text-teal-400 "
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  } ${!isAccessible(item) ? "opacity-40 pointer-events-none" : ""}`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
                {item.plan && !isAccessible(item) && (
                  <span className="ml-auto text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    {item.plan}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {user?.shopName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{user?.shopName}</p>
            <p className="text-[10px] text-gray-600 truncate capitalize">{user?.shopType}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
