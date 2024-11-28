import { useEffect, useState } from "react";
// import { IoMdDownload } from "react-icons/io";


const Sales = () => {
  const [salesList, setSalesList] = useState([]);




  useEffect(() => {
    const getSalesData = JSON.parse(localStorage.getItem("Sales")) || [];
    setSalesList(getSalesData);
  }, []);




  
  if (!salesList.length) {
    return (
      <div className="h-screen ">
        <div className="h-full  w-full  flex flex-col items-center justify-center">
          <h2 className="lg:text-2xl md:text-lg text-md font-semibold text-gray-600 tracking-wider">
            No Data available
          </h2>
        </div>
      </div>
    );
  }
  return (
    <div className=" w-full flex items-center justify-center">
      <div className="w-11/12 lg:mt-24 md:mt-20 mt-12 md:py-0 py-6  overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-800 shadow-sm shadow-violet-400  border">
          <thead className="bg-violet-500  text-white tracking-wider">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Customer Name</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2 text-center">Product Quantity</th>
              <th className="border p-2 text-center">Product Price</th>
              <th className="border p-2 text-center">Date</th>
              {/* <th className="border p-2 text-center">Invoice</th> */}
            </tr>
          </thead>
          <tbody>
            {salesList.map((sale, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2 font-medium ">
                  {sale.customer.name}
                </td>
                <td className="">
                  {sale.products.map((name) => (
                    <span
                      className="p-2 block border w-full"
                      key={name.productName}
                    >
                      {name.productName}
                    </span>
                  ))}
                </td>
                <td className=" text-center">
                  {sale.products.map((name) => (
                    <span
                      className="p-2 block border w-full"
                      key={name.productName}
                    >
                      {name.quantity}
                    </span>
                  ))}
                </td>
                <td className=" text-center">
                  {sale.products.map((name) => (
                    <span
                      className="p-2 block border w-full"
                      key={name.productName}
                    >
                      Rs {name.salePrice}
                    </span>
                  ))}
                </td>

                <td className="border p-2 text-center">{sale.customer.date}</td>
                {/* <td className=" border p-2 flex  justify-center">
                  <span>
                    <IoMdDownload size={20} />
                  </span>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
