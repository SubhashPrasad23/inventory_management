// import React from "react";
// import StepperControl from "./StepperControl";
import Stepper from "./Stepper";
import ProductDetails from "./ProductDetails";
import SupplierDetails from "./SupplierDetails";
import { useState } from "react";
import Complete from "./Complete";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Products = () => {
  const [productDetails, setProductDetails] = useState({
    productID: "",
    productName: "",
    productQuantity: "",
    productPrice: "",
    companyName: "",
  });


  const [supplierDetails, setSupplierDetails] = useState({
    supplierID: "",
    supplierName: "",
  });
  const navigate = useNavigate();

  const handleProductDetails = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSupplierDetails = (e) => {
    const { name, value } = e.target;
    setSupplierDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlerSave = () => {
    console.log("clicked");
    const existingProducts =
      JSON.parse(localStorage.getItem("ProductList")) || [];
    if (!Array.isArray(existingProducts)) {
      console.error(
        "Existing products is not an array. Resetting to an empty array."
      );
      localStorage.setItem("ProductList", JSON.stringify([]));
      return;
    }

    const updatedProducts = [...existingProducts, productDetails];

    localStorage.setItem("ProductList", JSON.stringify(updatedProducts));

    localStorage.setItem("supplier", JSON.stringify(supplierDetails));

    toast.success("Product added successfully");
    setTimeout(() => {
      navigate("/products");
    }, 3000);
  };

  const steps = [
    {
      name: "Product Details",
      component: (
        <ProductDetails
          productDetails={productDetails}
          handleChange={handleProductDetails}
        />
      ),
    },
    {
      name: "Supplier Details",
      component: (
        <SupplierDetails
          Details={supplierDetails}
          handleChange={handleSupplierDetails}
        />
      ),
    },
    {
      name: "Complete",
      component: (
        <Complete
          productDetails={productDetails}
          supplierDetails={supplierDetails}
        />
      ),
    },
  ];

  return (
    <div className="h-full w-full">
      <div className="w-full flex items-center justify-between shadow-xl p-4   mb-6">
        <h4 className="font-semibold text-2xl text-gray-800">Products</h4>
        <div className="text-gray-600">
          <div className="text-lg font-medium">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          <div className="text-sm font-light">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className=" m-5 px-5 py-8 space-y-8 bg-white  shadow-sm shadow-violet-400 border">
        <div className="">
          <h5 className="font-semibold xl:text-3xl md:text-2xl text-xl">
            Add Products ...
          </h5>
          <p className="text-gray-400  md:text-lg text-sm md:tracking-wider">
            Add Products in your inventory
          </p>
        </div>
        <Stepper
          stepsConfig={steps}
          handlerSave={handlerSave}
          productDetails={productDetails}
          supplierDetails={supplierDetails}
        />
      </div>
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default Products;
