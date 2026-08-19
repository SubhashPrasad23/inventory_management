import { useState, useEffect, useRef } from "react";
import { HiOutlinePlus, HiOutlineSearch, HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import EditProductModal from "../components/modals/EditProductModal";
import AddProductModal from "../components/modals/AddProductModal";
import Loading from "../components/Loading";
import API from "../api/axios";
import toast from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchTimeout = useRef(null);

  const fetchProducts = async (page = currentPage, search = searchTerm) => {
    setLoading(true);
    try {
      let url = `/products?page=${page}&limit=20`;
      if (search) url += `&search=${search}`;
      const { data } = await API.get(url);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, value);
    }, 400);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await API.delete(`/products/${id}`);
        toast.success("Product deleted");
        fetchProducts();
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  const getStockBadge = (product) => {
    if (product.quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700" };
    if (product.quantity <= product.minStockLevel) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700" };
    return { label: "In Stock", color: "bg-green-100 text-green-700" };
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-title whitespace-nowrap">Products ({totalProducts})</h1>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <HiOutlinePlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="input-field pl-10" placeholder="Search by name, category, or barcode..." />
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr className="text-left text-gray-600 text-xs">
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Product</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Barcode</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Stock</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Buy</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Sell</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const badge = getStockBadge(product);
                  return (
                    <tr key={product._id} className={`border-b hover:bg-gray-50 ${product.quantity === 0 ? "bg-red-50/50" : "border-gray-100"}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                        <p className="text-[11px] text-gray-400">{product.category} • {product.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{product.barcode || "-"}</td>
                      <td className="px-4 py-3 font-semibold">{product.quantity}</td>
                      <td className="px-4 py-3 text-xs">₹{product.purchasePrice}</td>
                      <td className="px-4 py-3 text-teal-700 font-medium text-xs">₹{product.salePrice}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.color}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditProduct(product)} className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product._id, product.name)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
         {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary text-xs disabled:opacity-50">Prev</button>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary text-xs disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddForm && (
        <AddProductModal onClose={() => setShowAddForm(false)} onAdded={() => fetchProducts()} />
      )}

      {/* Edit Modal */}
      {editProduct && (
        <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onUpdated={() => fetchProducts()} />
      )}
    </div>
  );
};

export default Products;
