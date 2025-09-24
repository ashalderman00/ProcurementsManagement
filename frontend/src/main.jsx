import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing";
import IntakeChecklist from "./pages/IntakeChecklist";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import RequestDetailRoute from "./pages/RequestDetailRoute";
import Approvals from "./pages/Approvals";
import Settings from "./pages/Settings";
import Vendors from "./pages/Vendors";
import PurchaseOrders from "./pages/PurchaseOrders";
import Catalog from "./pages/Catalog";
import Integrations from "./pages/Integrations";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AuthProvider, RequireAuth } from "./lib/auth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/resources/intake-checklist"
            element={<IntakeChecklist />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app"
            element={(
              <RequireAuth>
                <App />
              </RequireAuth>
            )}
          >
            <Route index element={<Dashboard />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="requests" element={<Requests />}>
              <Route path=":id" element={<RequestDetailRoute />} />
            </Route>
            <Route path="approvals" element={<Approvals />} />
            <Route path="settings" element={<Settings />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="integrations" element={<Integrations />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
