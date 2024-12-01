import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Billing = () => {
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    date: new Date().toLocaleDateString(),
  });
  const [rows, setRows] = useState([
    { id: 1, productName: "", salePrice: "", quantity: "", itemTotal: 0 },
  ]);
  const [productList, setProductList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("ProductList")) || [];
    setProductList(data);
  }, []);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        productName: "",
        salePrice: "",
        quantity: "",
        itemTotal: 0,
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
              itemTotal:
                field === "quantity" || field === "salePrice"
                  ? (field === "quantity" ? value : row.quantity) *
                    (field === "salePrice" ? value : row.salePrice)
                  : row.itemTotal,
            }
          : row
      )
    );
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateOrderTotal = () =>
    rows.reduce((total, row) => total + parseFloat(row.itemTotal || 0), 0);

  const handlePayment = () => {
    const hasEmptyFields = rows.some(
      (row) => !row.productName || !row.salePrice || !row.quantity
    );
    if (!customerDetails.name || !customerDetails.address || hasEmptyFields) {
      toast.error("All fields are mandatory.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
const insufficientStock = rows.some((row) => {
  const selectedProduct = productList.find(
    (product) => product.productName === row.productName
  );
  if (selectedProduct) {
    const enteredQuantity = Number(row.quantity) || 0;
    const availableQuantity = Number(selectedProduct.productQuantity) || 0;
    if (enteredQuantity > availableQuantity) {
      toast.error(
        `Insufficient stock for ${row.productName}: Available ${availableQuantity}`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      return true;
    }
  }
  return false;
});
if (insufficientStock) {
  return;
}
    const updatedProducts = productList.map((product) => {
      const purchasedProduct = rows.find(
        (row) => row.productName === product.productName
      );
      return purchasedProduct
        ? {
            ...product,
            productQuantity:
              product.productQuantity - purchasedProduct.quantity,
          }
        : product;
    });


    
    const saleData = {
      customer: customerDetails,
      products: rows,
      orderTotal: calculateOrderTotal(),
    };

    const existingSales = JSON.parse(localStorage.getItem("Sales")) || [];
    localStorage.setItem("Sales", JSON.stringify([...existingSales, saleData]));
    localStorage.setItem("ProductList", JSON.stringify(updatedProducts));
    toast.success("Payment successful! Sale saved.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setTimeout(() => navigate("/sales"), 2000);
  };

  return (
    <div className="w-full min-h-screen flex justify-center  py-6 px-4 ">
      <div className="w-full h-full md:w-5/6  md:mt-16 mt-12 p-5 bg-white shadow-sm shadow-violet-400  border border-gray-200">
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold text-gray-800 mb-6">
          Bill To
        </h2>
        <div className="w-full mb-6">
          <div className="md:text-end  h-full ">
            <label className="font-semibold tracking-wider text-sm">DATE</label>
            <input
              type="text"
              name="name"
              readOnly
              value={customerDetails.date}
              onChange={() =>
                setCustomerDetails((prev) => ({
                  ...prev,
                  date: customerDetails.date,
                }))
              }
              className="w-full md:text-end outline-none  placeholder:tracking-wider"
              placeholder="Enter customer name"
            />
          </div>
          <div className="w-full">
            <input
              type="text"
              name="name"
              value={customerDetails.name}
              onChange={(e) =>
                setCustomerDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="xl:w-2/6 lg:w-2/4 md:w-2/4  w-full mt-2 py-1  border-b-2 border-gray-300  focus:outline-none  placeholder:tracking-wider"
              placeholder="Enter customer name"
            />
          </div>
          <div className="w-full">
            <input
              type="text"
              name="address"
              value={customerDetails.address}
              onChange={(e) =>
                setCustomerDetails((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="xl:w-2/6 lg:w-2/4 md:w-2/4  w-full mt-2 py-1  border-b-2 border-gray-300 focus:outline-none placeholder:tracking-wider"
              placeholder="Enter address"
            />
          </div>
        </div>
        <div className="overflow-x-auto  shadow mb-6">
          <table className="w-full text-sm text-left text-gray-800 border">
            <thead className="bg-violet-500  text-white tracking-wider ">
              <tr className="">
                <th className="p-4 border">#</th>
                <th className="p-4 border">Product Name</th>
                <th className="p-4 border">Sale Price</th>
                <th className="p-4 border">Quantity</th>
                <th className="p-4 border">Item Total</th>
                <th className="p-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-100 transition shadow-inner shadow-gray-50"
                >
                  <td className="p-4 border">{row.id}</td>
                  <td className="p-4 border">
                    <select
                      value={row.productName}
                      onChange={(e) =>
                        handleInputChange(index, "productName", e.target.value)
                      }
                      className="w-full p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product</option>
                      {productList.map((product) => (
                        <option
                          key={product.productName}
                          value={product.productName}
                        >
                          {product.productName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 border">
                    <input
                      type="number"
                      min={1}
                      value={row.salePrice}
                      onChange={(e) =>
                        handleInputChange(index, "salePrice", e.target.value)
                      }
                      className="w-full p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 border">
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) =>
                        handleInputChange(index, "quantity", e.target.value)
                      }
                      className="w-full p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 border text-right font-semibold">
                    Rs {row.itemTotal.toFixed(2) || 0}
                  </td>
                  <td className="p-4 border text-center">
                    <button onClick={() => handleDeleteRow(index)}>
                      <MdDelete
                        size={24}
                        className="text-red-600 hover:text-red-800 transition"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleAddRow}
            className="mt-2 bg-violet-600 tracking-tight font-thin text-white md:px-4 px-2 md:py-2 py-0.5  rounded-tr-2xl shadow-inner shadow-violet-200 hover:bg-violet-700 transition-all"
          >
            + Add New Row
          </button>
        </div>
        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <div className="flex justify-between mb-4">
            <span className="text-lg font-medium text-gray-800">
              Order Total
            </span>
            <span className="text-lg font-semibold text-gray-900">
              Rs {calculateOrderTotal().toFixed(2)}
            </span>
          </div>
          <button
            onClick={handlePayment}
            className="w-full bg-violet-500 tracking-wide md:text-xl text-white px-4 py-2 rounded-sm shadow-inner shadow-violet-600 hover:bg-violet-600 transition-all"
          >
            Complete Payment
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Billing;
