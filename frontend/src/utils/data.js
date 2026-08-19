// Product Categories
export const PRODUCT_CATEGORIES = [
  "General",
  "Grocery",
  "Dairy",
  "Beverages",
  "Snacks",
  "Personal Care",
  "Household",
  "Electronics",
  "Stationery",
  "Medicine",
  "Vegetables",
  "Fruits",
  "Bakery",
  "Frozen Food",
];

// Product Units
export const PRODUCT_UNITS = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kg" },
  { value: "ltr", label: "Litre" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
];

// Subscription Plans
export const PLANS = [
  {
    name: "starter",
    title: "Starter",
    price: "Free",
    features: ["50 products", "50 bills/month", "Camera scan", "Basic PDF"],
    color: "border-slate-200",
  },
  {
    name: "business",
    title: "Business",
    price: "₹299/mo",
    features: ["500 products", "Unlimited bills", "AI insights", "Reports", "All scan methods"],
    color: "border-emerald-300",
    popular: true,
  },
  {
    name: "pro",
    title: "Pro",
    price: "₹799/mo",
    features: ["Unlimited everything", "AI Assistant Chat", "Predictions", "Custom reports", "Priority support"],
    color: "border-indigo-300",
  },
];

// Payment Modes
export const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
];

// Shop Types
export const SHOP_TYPES = [
  { value: "retailer", label: "Retailer" },
  { value: "wholesaler", label: "Wholesaler" },
];