import { BsGraphDownArrow } from "react-icons/bs";
import { useEffect, useState } from "react";
import { BsGraphUpArrow } from "react-icons/bs";

const DashBoard = () => {
  const [totalSale, setTotalSale] = useState([]);
  const [totalExpense, setTotalExpenses] = useState([]);

  useEffect(() => {
    const Sale = JSON.parse(localStorage.getItem("Sales")) || [];
    setTotalSale(Sale);
    const Expenses = JSON.parse(localStorage.getItem("ProductList")) || [];
    setTotalExpenses(Expenses);
  }, []);

  const calculateTotalExpenses = () =>
    totalExpense.reduce(
      (total, expense) => total + (Number(expense.productPrice) || 0),
      0
    );

  const calculateTotalSale = () =>
    totalSale.reduce(
      (total, sale) => total + (Number(sale.orderTotal) || 0),
      0
    );

  const calculateTotalIncome = () =>
    calculateTotalSale() - calculateTotalExpenses();

const summaryData = [
  { name: "Total Sale", value: calculateTotalSale() },
  { name: "Total Expense", value: calculateTotalExpenses() },
  { name: "Total Income", value: calculateTotalIncome() },
];



  return (
    <div className=" w-full flex items-center justify-center">
      <div className=" w-11/12 lg:mt-24 md:mt-20 mt-12 md:py-0 py-6 flex justify-center ">
        <div className="w-full h-full grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-10">
          {summaryData.map((data) => (
            <div
              key={data.name}
              className="p-3  w-full bg-white shadow-sm shadow-violet-400 border"
            >
              <div className="h-full w-full flex flex-col justify-between space-y-16 p-5 md:text-2xl text-lg text-center">
                <p className=" font-bold  text-gray-400">{data.name}</p>
                <div
                  className={`flex items-center  ${
                    data.name === "Total Income"
                      ? "justify-between"
                      : "justify-center"
                  }`}
                >
                  <span className="block">Rs {data.value.toFixed(2)}</span>
                  <span className="block">
                    {data.name === "Total Income" &&
                      (calculateTotalExpenses() > calculateTotalSale() ? (
                        <BsGraphDownArrow size={35} color="red" />
                      ) : (
                        <BsGraphUpArrow size={35} color="green" />
                      ))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
