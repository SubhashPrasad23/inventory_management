import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashBoard from "./components/DashBoard.jsx";
import AddProducts from "./components/AddProducts.jsx";
import Sales from "./components/Sales.jsx";
// import Settings from "./components/Settings.jsx";
import ProductsList from "./components/ProductsList.jsx";
import Billing from "./components/Billing.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "/",
          element: <DashBoard />,
        },

        {
          path: "/products",
          element: <ProductsList />,
        },
        {
          path: "/addproducts",
          element: <AddProducts />,
        },
        {
          path: "/sales",
          element: <Sales />,
        },
        // {
        //   path: "/Settings",
        //   element: <Settings />,
        // },

        { path: "/billing", element: <Billing /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true, // Enables relative paths in nested routes
      v7_fetcherPersist: true, // Retains fetcher state during navigation
      v7_normalizeFormMethod: true, // Normalizes form methods (e.g., POST or GET)
      v7_partialHydration: true, // Supports partial hydration for server-side rendering
      v7_skipActionErrorRevalidation: true, // Prevents revalidation when action errors occur
    },
  }
);

createRoot(document.getElementById("root")).render(
  <RouterProvider
    future={{ v7_startTransition: true }} // Enables React's startTransition API
    router={router}
  />
);
