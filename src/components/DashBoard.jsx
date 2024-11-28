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

  return (
    <div className="h-full w-full flex flex-col items-center ">
      <div className="w-full flex items-center justify-between shadow-xl p-4  mb-6">
        <h4 className="font-semibold text-2xl text-gray-800">
          Inventory Overview
        </h4>
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

      <div className="h-3/4 w-11/12 flex justify-center p-5">
        <div className="w-full h-full grid 2xl:grid-cols-3 xl:grid-cols-2 grid-cols-1 gap-10">
          <div className="h-56 lg:w-11/12 w-full bg-white shadow-sm shadow-violet-400 border">
            <div className="h-full w-full flex flex-col justify-between p-5 text-2xl text-center">
              <p className=" font-bold  text-gray-400">
                Total Sale
              </p>
              <p>
                <span>Rs</span> {calculateTotalSale().toFixed(2)}
              </p>
            </div>
          </div>
          <div className="h-56 lg:w-11/12 w-full bg-white shadow-sm shadow-violet-400 border">
            <div className="h-full w-full flex flex-col justify-between p-5 text-2xl text-center">
              <p className=" font-bold  text-gray-400">
                Total Expense
              </p>

              <p className="">
                <span>Rs</span> {calculateTotalExpenses().toFixed(2)}
              </p>
            </div>
          </div>
          <div className="h-56 lg:w-11/12 w-full bg-white shadow-sm shadow-violet-400 border">
            <div className="h-full w-full flex flex-col justify-between p-5 text-2xl">
              <p className="font-bold  text-center text-gray-400">
                Total Income
              </p>
              <div className="flex items-center justify-around">
                <p className="">
                  <span>Rs</span> {calculateTotalIncome().toFixed(2)}
                </p>
                {calculateTotalExpenses() > calculateTotalSale() ? (
                  <BsGraphDownArrow size={35} color="red" />
                ) : (
                  <BsGraphUpArrow size={35} color="green" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
