import { create } from "zustand";

const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (data) => set({ products: data }),
  setLoading: (val) => set({ loading: val }),

  addToProducts: (product) => set((state) => ({ products: [product, ...state.products] })),

  removeProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p._id !== id),
  })),

  updateInList: (id, updated) => set((state) => ({
    products: state.products.map((p) => (p._id === id ? updated : p)),
  })),
}));

export default useProductStore;
