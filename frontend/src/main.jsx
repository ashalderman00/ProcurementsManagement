import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Approvals from "./pages/Approvals";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequestDetailRoute from "./pages/RequestDetailRoute";
import { ToastProvider } from "./components/toast";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    element: <App />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/requests", element: <Requests /> },
      { path: "/requests/:id", element: <RequestDetailRoute /> },
      { path: "/approvals", element: <Approvals /> },
      { path: "/settings", element: <Settings /> },
      { path: "*", element: <div className="text-center text-gray-600 p-6">Not Found</div> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider><RouterProvider router={router} /></ToastProvider>
  </React.StrictMode>
);
