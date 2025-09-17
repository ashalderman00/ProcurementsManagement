import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LogOut, ShoppingCart, CheckSquare, Settings as Cog, LayoutGrid, LogIn, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); location.href="/login"; }

  return (
    <div className="min-h-screen gradient-hero text-slate-900 grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r border-slate-200 bg-white/70 backdrop-blur">
        <div className="px-5 py-4 font-bold tracking-wide border-b border-slate-100">🛒 Procurement</div>
        <nav className="p-3 space-y-1">
          <Nav to="/" icon={<LayoutGrid size={16}/>}>Dashboard</Nav>
          <Nav to="/requests" icon={<ShoppingCart size={16}/>}>Requests</Nav>
          <Nav to="/approvals" icon={<CheckSquare size={16}/>}>Approvals</Nav>
          <Nav to="/settings" icon={<Cog size={16}/>}>Settings</Nav>
          <Nav to="/vendors" icon={<ShoppingCart size={16}/>}>Vendors</Nav>
        </nav>
        <div className="mt-auto p-3 border-t border-slate-100 space-y-2">
          {user ? (
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600 truncate max-w-[140px]">{user.email}</div>
              <button onClick={logout} className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 press"><LogOut size={16}/> Logout</button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <a className="inline-flex items-center gap-1 text-blue-600 press" href="/login"><LogIn size={16}/> Login</a>
              <a className="inline-flex items-center gap-1 text-slate-700 press" href="/signup"><UserPlus size={16}/> Sign up</a>
            </div>
          )}
          <ThemeToggle />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="md:hidden sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200">
  <div className="px-4 py-3 font-bold tracking-wide flex items-center justify-between">
    <span>🛒 Procurement</span>
    {user ? (
      <a className="text-sm text-blue-700" href="/requests">Requests</a>
    ) : (
      <div className="flex items-center gap-3 text-sm">
        <a className="text-blue-700" href="/login">Login</a>
        <a className="text-slate-700" href="/signup">Sign up</a>
      </div>
    )}
  </div>
</header>

        <AnimatedOutlet />
        <footer className="container py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Procurement Manager
        </footer>
      </div>
    </div>
  );
}

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <div className="container py-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: .24, ease: 'easeOut' } }}
          exit={{ opacity: 0, y: -6, transition: { duration: .18 } }}
          className="space-y-6"
        >
          <Hero />
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Hero() {
  const path = location.pathname.replace(/^\//,'') || 'dashboard';
  const title = path.split('/')[0];
  const pretty = title.charAt(0).toUpperCase() + title.slice(1);
  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-5">
      <div className="text-xs text-slate-500">Home / {pretty}</div>
      <h1 className="text-2xl md:text-3xl font-semibold mt-1">{pretty}</h1>
    </div>
  );
}

function Nav({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm press " +
        (isActive ? "bg-white text-blue-700 font-medium shadow-sm" : "text-slate-700 hover:bg-white/60")
      }
    >
      {icon}{children}
    </NavLink>
  );
}
