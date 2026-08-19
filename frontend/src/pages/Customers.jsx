import { useState, useEffect } from "react";
import { HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";
import Loading from "../components/Loading";
import API from "../api/axios";
import toast from "react-hot-toast";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get("/customers");
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await API.delete(`/customers/${id}`);
      setCustomers(customers.filter((c) => c._id !== id));
      toast.success("Customer deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const filteredCustomers = customers.filter((custo) =>
    custo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    custo.phone?.includes(searchTerm)
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Customers ({customers.length})</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
          placeholder="Search by name or phone..."
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No customers yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr className="text-left text-gray-600 text-xs">
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Address</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Orders</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Total Spent</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{customer.phone || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{customer.address || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{customer.totalPurchases}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-teal-700">&#8377;{customer.totalSpent?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCustomer(customer._id)} className="text-red-400 hover:text-red-600">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
