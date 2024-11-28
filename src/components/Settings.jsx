import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Settings = () => {
  const hey = () => toast.success("Wow so easy!");

  return (
    <div className="h-screen w-1/5">
      <button onClick={hey}>Notify!</button>
      <ToastContainer />
    </div>
  );
};

export default Settings;
