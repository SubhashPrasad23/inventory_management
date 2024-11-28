import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen w-full flex  bg-gray-100">
      <div className="h-full 2xl:w-2/12 lg:w-3/12 md:w-2/6 sm:w-2/6 w-[15%]  transition-all">
        <Sidebar />
      </div>
      <div className="h-full 2xl:w-10/12  lg:w-9/12 sm:w-4/6 w-[85%]">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

export default App;
