import { useState } from "react";

const ProductDetails = ({ productDetails, handleChange }) => {

  return (
    <div className="w-full mt-5">
      <h6 className="font-semibold md:text-3xl tracking-wider  text-gray-500">
        Product Details
      </h6>
      <div className="w-full  flex flex-col justify-between mt-6">
        <form className="w-full grid xl:grid-cols-3 md:grid-cols-2 md:gap-5 gap-3">
          <input
            type="text"
            placeholder="Enter Product ID"
            value={productDetails.productID}
            name="productID"
            onChange={handleChange}
            className="w-full border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
          />
          <input
            type="text"
            placeholder="Enter Product Name"
            value={productDetails.productName}
            name="productName"
            onChange={handleChange}
            className="w-full border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
          />
          <input
            type="number"
            placeholder="Enter Quantity"
            min="1"
            value={productDetails.productQuantity}
            name="productQuantity"
            onChange={handleChange}
            className="w-full border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
          />
          <input
            type="number"
            placeholder="Enter Price"
            min="1"
            value={productDetails.productPrice}
            name="productPrice"
            onChange={handleChange}
            className="w-full border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
          />
          <input
            type="file"
            className="w-full border md:p-3 p-2 rounded-lg focus:outline-none focus:border-blue-400 focus:border-2 shadow-sm"
          />
          <input
            type="text"
            placeholder="Enter Company Name"
            value={productDetails.companyName}
            name="companyName"
            onChange={handleChange}
            className="w-full border md:p-3 p-2 rounded-lg"
          />
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;
