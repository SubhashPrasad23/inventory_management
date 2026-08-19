import { createPortal } from "react-dom";
import { HiOutlineX } from "react-icons/hi";

const PurchaseDetailModal = ({ purchase, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Purchase Invoice</h2>
            <p className="text-xs text-gray-400">{new Date(purchase.createdAt).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Supplier */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Supplier</p>
            <p className="text-sm font-bold text-gray-800">{purchase.supplierName}</p>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold mb-1">Notes</p>
              <p className="text-sm text-gray-700">{purchase.notes}</p>
            </div>
          )}

          {/* Table */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">Items ({purchase.items?.length})</p>
            <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500 text-xs">
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">Product</th>
                    <th className="px-4 py-2.5 font-medium text-right">Qty</th>
                    <th className="px-4 py-2.5 font-medium text-right">Price</th>
                    <th className="px-4 py-2.5 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items?.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{item.productName}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">₹{item.price}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">₹{item.itemTotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Grand Total</td>
                    <td className="px-4 py-2.5 text-right font-bold text-teal-700">₹{purchase.totalAmount?.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    , document.body
  );
};

export default PurchaseDetailModal;
