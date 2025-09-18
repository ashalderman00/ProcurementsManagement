import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import Landing from "./pages/Landing";
import App from "./App";                // app shell (sidebar etc.)
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Approvals from "./pages/Approvals";
import Settings from "./pages/Settings";
import Vendors from "./pages/Vendors";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequestDetailRoute from "./pages/RequestDetailRoute";
import { ToastProvider } from "./components/toast";
import ErrorBoundary from "./components/ErrorBoundary";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/app",
    element: <App />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "requests", element: <Requests /> },
      { path: "requests/:id", element: <RequestDetailRoute /> },
      { path: "approvals", element: <Approvals /> },
      { path: "settings", element: <Settings /> },
      { path: "vendors", element: <Vendors /> },
      { path: "*", element: <div className="text-center text-gray-600 p-6">Not Found</div> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider><RouterProvider router={router} /></ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
