import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiGet } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const bootstrapping = useRef(false);

  const setSession = useCallback((token, nextUser) => {
    if (token && nextUser) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
      setStatus("authenticated");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const bootstrap = useCallback(async () => {
    if (bootstrapping.current) return;
    bootstrapping.current = true;
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setSession(null, null);
      bootstrapping.current = false;
      return;
    }
    setStatus((prev) => (prev === "authenticated" ? prev : "checking"));
    try {
      const data = await apiGet("/api/me");
      if (data && data.user) {
        setSession(storedToken, data.user);
      } else {
        throw new Error("missing user");
      }
    } catch (err) {
      console.warn("Session bootstrap failed", err);
      setSession(null, null);
    } finally {
      bootstrapping.current = false;
    }
  }, [setSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const logout = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  const value = useMemo(
    () => ({ user, status, setSession, logout, bootstrap }),
    [user, status, setSession, logout, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function RequireAuth({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center text-sm text-slate-500">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-6 py-4 shadow-sm">
          Verifying session…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}

export { AuthContext };
