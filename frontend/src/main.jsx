import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing";
import IntakeChecklist from "./pages/IntakeChecklist";
import App from "./App";
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
            path="/app/*"
            element={(
              <RequireAuth>
                <App />
              </RequireAuth>
            )}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
