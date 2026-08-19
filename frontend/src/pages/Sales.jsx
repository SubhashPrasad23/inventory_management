import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { HiOutlineDownload, HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import Loading from "../components/Loading";
import API from "../api/axios";
import toast from "react-hot-toast";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchSales();
  }, [currentPage, startDate, endDate]);

  const fetchSales = async (search = searchTerm) => {
    setLoading(true);
    try {
      let url = `/sales?page=${currentPage}&limit=15`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (search) url += `&search=${search}`;
      const { data } = await API.get(url);
      setSales(data.sales || []);
      setTotalPages(data.totalPages || 1);
      setTotalSales(data.totalSales || 0);
    } catch {
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchSales(value);
    }, 400);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const downloadInvoice = async (saleId, template) => {
    setDownloadingId(saleId);
    try {
      const response = await API.get(`/sales/invoice/${saleId}?template=${template}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${template}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded!");
    } catch {
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingId(null);
      setShowTemplateModal(false);
    }
  };

  if (loading && sales.length === 0) return <Loading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Sales & Invoices</h1>
        <span className="text-xs text-gray-400">{totalSales} total</span>
      </div>

      {/* Search + Date Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by customer or invoice..."
          />
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="input-field text-xs w-36"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="input-field text-xs w-36"
          />
          {(startDate || endDate || searchTerm) && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap">
              Clear
            </button>
          )}
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No sales found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr className="text-left text-gray-600 text-xs">
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Invoice</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Customer</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Items</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Payment</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">PDF</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-teal-600 font-medium">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 text-xs md:text-sm">{sale.customerName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{sale.items?.length} items</td>
                    <td className="px-4 py-3 font-semibold">₹{sale.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${sale.paymentMode === "cash" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{sale.paymentMode}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(sale.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedSaleId(sale._id); setShowTemplateModal(true); }}
                        disabled={downloadingId === sale._id}
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition disabled:opacity-50"
                      >
                        <HiOutlineDownload className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary text-xs disabled:opacity-50">Prev</button>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary text-xs disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowTemplateModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTemplateModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <HiOutlineX className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-gray-900 mb-4">Choose Template</h3>
            <div className="space-y-2">
              <button onClick={() => downloadInvoice(selectedSaleId, "professional")} className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition">
                <p className="text-sm font-medium text-gray-800">Professional</p>
                <p className="text-[10px] text-gray-400">Navy header, clean layout with BILL TO section</p>
              </button>
              <button onClick={() => downloadInvoice(selectedSaleId, "modern")} className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition">
                <p className="text-sm font-medium text-gray-800">Modern</p>
                <p className="text-[10px] text-gray-400">Yellow accent, brand-focused with footer bar</p>
              </button>
            </div>
          </div>
        </div>
        , document.body
      )}
    </div>
  );
};

export default Sales;
