import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("userInfo")) || null,
  loading: false,
  error: null,

  setUser: (data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    set({ user: data });
  },

  setLoading: (val) => set({ loading: val }),
  setError: (msg) => set({ error: msg }),

  logout: () => {
    localStorage.removeItem("userInfo");
    set({ user: null });
  },
}));

export default useAuthStore;
