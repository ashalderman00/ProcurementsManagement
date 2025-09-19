import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import RequestDetailRoute from "./pages/RequestDetailRoute";
import Approvals from "./pages/Approvals";
import Settings from "./pages/Settings";
import Vendors from "./pages/Vendors";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<Requests />}>
            <Route path=":id" element={<RequestDetailRoute />} />
          </Route>
          <Route path="approvals" element={<Approvals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="vendors" element={<Vendors />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
