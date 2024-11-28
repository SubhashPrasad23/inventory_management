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
    <div className=" w-full flex items-center justify-center md:py-0 py-6">
      <div className="w-5/6 lg:mt-24 mt-16 px-5 py-6 space-y-8 bg-white  shadow-sm shadow-violet-400 border">
        <p className="text-gray-400 md:text-lg text-sm md:tracking-wider">
          Add Products in your inventory
        </p>
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
