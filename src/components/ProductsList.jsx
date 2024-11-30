import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductsList = () => {
  const [product, setProduct] = useState([]);

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem("ProductList")) || [];
    setProduct(products);

    products.forEach((product) => {
      if (product.productQuantity < 5) {
        toast.warn(`${product.productName} is low in stock!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
  }, []);

  if (!product.length) {
    return (
      <div className="h-screen w-full">
        <div className="h-full w-full  flex flex-col items-center justify-center">
          <h2 className="lg:text-2xl md:text-lg text-md font-semibold text-gray-600 tracking-wider">
            No products available
          </h2>
          <p className="text-gray-500 mb-4 lg:text-xl text-sm tracking-wide">
            Click below to add your first product!
          </p>
          <button
            onClick={() => (window.location.href = "/addproducts")}
            className="bg-violet-500 tracking-wider text-white lg:text-lg text-sm md:px-4 md:py-2 p-1.5 rounded-md hover:bg-violet-600"
          >
            Add Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" h-full  w-full flex justify-center py-6 px-4 ">
      <div className="w-11/12 md:mt-16 mt-12  overflow-x-auto">
        <table className="w-full shadow-sm shadow-violet-400 border border-collapse  ">
          <thead className="bg-violet-500  text-white tracking-wider ">
            <tr>
              <th className="border md:p-2 p-1">#</th>
              <th className="border md:p-2 p-1">Product Name</th>
              <th className="border md:p-2 p-1">Product Image</th>
              <th className="border md:p-2 p-1">Product Quantity</th>
              <th className="border md:p-2 p-1">Product Price</th>
              <th className="border md:p-2 p-1">Company Name</th>
            </tr>
          </thead>
          <tbody>
            {product.map((product, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2 text-lg font-semibold tracking-wider">
                  {product.productName.charAt(0).toUpperCase() +
                    product.productName.slice(1)}
                </td>
                <td className="border p-2 flex items-center justify-center">
                  <div className="h-12 w-16 border bg-gray-200 "></div>
                </td>
                <td className="border p-2 text-center">
                  {product.productQuantity}
                </td>
                <td className="border p-2 text-center">
                  Rs {product.productPrice}
                </td>
                <td className="border p-2">
                  {product.companyName.charAt(0).toUpperCase() +
                    product.companyName.slice(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductsList;
