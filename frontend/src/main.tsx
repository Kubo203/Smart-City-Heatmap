import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Login from "./pages/Login.tsx";
import MapPage from "./pages/MapPage.tsx";
import InstructionPage from "./pages/InstructionPage.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import "./index.css";
import "./utils/i18n.ts";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MapPage />,
      },
      {
        path: "instruction",
        element: <InstructionPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
