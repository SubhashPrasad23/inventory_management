import { IoMdLogOut } from "react-icons/io";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaPlusSquare,
  FaChartLine,
  FaFileInvoiceDollar,
  // FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/" },
    { label: "Products", icon: <FaBoxOpen />, path: "/products" }, 
    { label: "Add Products", icon: <FaPlusSquare />, path: "/addproducts" },
    { label: "Sales", icon: <FaChartLine />, path: "/sales" }, 
    { label: "Billing", icon: <FaFileInvoiceDollar />, path: "/billing" },
    // { label: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <div className="h-full  2xl:w-2/12 lg:w-3/12 md:w-2/6 sm:w-2/6 w-[15%] fixed shadow-2xl  bg-violet-500 rounded-tr-3xl rounded-br-3xl transition-all">
      <div className=" drop-shadow-lg text-white  text-lg font-bold  sm:border-b-2  py-4 md:px-8 px-4">
        <h4 className="sm:block hidden md:text-xl text-lg font-semibold  tracking-widest">
          Inventory
        </h4>
        
        <span className="sm:block hidden tracking-wider xl:text-3xl lg:text-2xl text-xl">
          Management
        </span>
      </div>

      <div className="h-5/6 sm:mt-0 mt-16  flex flex-col justify-between  md:px-5  sm:px-6 px-2 pt-4 font-light lg:text-lg text-md lg:tracking-widest">
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <NavLink
              to={`${item.path.toLowerCase()}`}
              key={index}
              className={({ isActive }) =>
                `flex items-center hover:bg-violet-400 rounded-md text-white hover:text-white sm:p-4 p-2 ${
                  isActive ? "bg-violet-400 text-white " : ""
                }`
              }
            >
              <li className="flex items-center md:gap-4 sm:gap-2.5 gap-0 ">
                <span className=" lg:text-3xl md:text-2xl text-2xl text-white ">
                  {item.icon}
                </span>
                <span className="sm:block hidden">{item.label}</span>
              </li>
            </NavLink>
          ))}
        </ul>

        {/* <div className="flex items-center md:gap-4 gap-0 bg-violet-400 hover:bg-violet-600 sm:p-2 p-1 rounded-md">
          <IoMdLogOut size={30} color="white" />
          <span className="text-white sm:block hidden">Logout</span>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
