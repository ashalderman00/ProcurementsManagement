import {
  NavLink,
  Link,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  LogOut,
  ShoppingCart,
  CheckSquare,
  Settings as Cog,
  LayoutGrid,
  LogIn,
  UserPlus,
  FileSpreadsheet,
  Boxes,
  Handshake,
  Globe2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import { useAuth } from "./lib/auth";
import Dashboard from "./pages/Dashboard";
import PurchaseOrders from "./pages/PurchaseOrders";
import Catalog from "./pages/Catalog";
import Requests from "./pages/Requests";
import RequestDetailRoute from "./pages/RequestDetailRoute";
import Approvals from "./pages/Approvals";
import Vendors from "./pages/Vendors";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";

const NAV_ITEMS = {
  dashboard: {
    to: "/app",
    label: "Dashboard",
    quickLabel: "Control center overview",
    icon: LayoutGrid,
    end: true,
  },
  purchaseOrders: {
    to: "/app/purchase-orders",
    label: "Purchase orders",
    icon: FileSpreadsheet,
  },
  catalog: {
    to: "/app/catalog",
    label: "Catalogue",
    quickLabel: "Catalogue workspace",
    icon: Boxes,
  },
  requests: {
    to: "/app/requests",
    label: "Requests",
    quickLabel: "Requests pipeline",
    icon: ShoppingCart,
  },
  approvals: {
    to: "/app/approvals",
    label: "Approvals",
    quickLabel: "Approval routing",
    icon: CheckSquare,
  },
  vendors: {
    to: "/app/vendors",
    label: "Vendors",
    quickLabel: "Preferred vendors",
    icon: Handshake,
  },
  integrations: {
    to: "/app/integrations",
    label: "Integrations",
    quickLabel: "PunchOut & integrations",
    icon: Globe2,
  },
  settings: {
    to: "/app/settings",
    label: "Settings",
    quickLabel: "Workspace settings",
    icon: Cog,
  },
};

const NAV_GROUPS = [
  {
    id: "control",
    label: "Control center",
    description: "High-level overview of spend and activity.",
    items: ["dashboard"],
  },
  {
    id: "operations",
    label: "Procure-to-pay",
    description: "Intake demand and convert approvals into purchase orders.",
    items: ["purchaseOrders", "requests", "approvals"],
  },
  {
    id: "catalogue",
    label: "Catalogue & suppliers",
    description: "Keep buying content and partners in sync.",
    items: ["catalog", "vendors"],
  },
  {
    id: "connectivity",
    label: "Connectivity",
    description: "Integrate storefronts, ERPs, and automation feeds.",
    items: ["integrations"],
  },
  {
    id: "admin",
    label: "Administration",
    description: "Manage policies, thresholds, and workspace access.",
    items: ["settings"],
  },
];

const QUICK_LINK_GROUPS = {
  control: {
    id: "control",
    label: "Control center",
    description: "Jump back to the executive overview and KPI rollups.",
    items: ["dashboard"],
  },
  operations: {
    id: "operations",
    label: "Procure-to-pay",
    description: "Move requisitions to fully approved spend commitments.",
    items: ["purchaseOrders", "requests", "approvals"],
  },
  catalogue: {
    id: "catalogue",
    label: "Catalogue & suppliers",
    description: "Curate items and manage supplier relationships.",
    items: ["catalog", "vendors"],
  },
  connectivity: {
    id: "connectivity",
    label: "Connectivity",
    description: "Sync purchasing data with ERPs, PunchOut, and automation.",
    items: ["integrations"],
  },
  admin: {
    id: "admin",
    label: "Administration",
    description: "Tune controls, thresholds, and user access.",
    items: ["settings"],
  },
};

const DEFAULT_QUICK_LINK_GROUPS = ["operations", "catalogue", "connectivity"];

const HERO_META = {
  dashboard: {
    crumb: "Dashboard",
    title: "Procurement control center",
    description:
      "Monitor spend commitments, catalogue health, and supplier activity in a finance-ready workspace.",
    quickLinkGroups: ["operations", "catalogue", "connectivity", "admin"],
  },
  "purchase-orders": {
    crumb: "Purchase orders",
    title: "Purchase orders",
    description:
      "Issue, track, and reconcile the purchase orders that drive your spend commitments.",
    quickLinkGroups: ["operations", "connectivity", "catalogue"],
  },
  catalog: {
    crumb: "Catalogue",
    title: "Catalogue",
    description:
      "Curate approved items, manage vendor content, and keep teams buying from the right sources.",
    quickLinkGroups: ["catalogue", "operations", "connectivity"],
  },
  requests: {
    crumb: "Requests",
    title: "Requests",
    description:
      "Review demand, shepherd approvals, and convert qualified requisitions into purchase orders.",
    quickLinkGroups: ["operations", "catalogue"],
  },
  approvals: {
    crumb: "Approvals",
    title: "Approvals",
    description:
      "Align stakeholders on spend decisions and keep purchasing compliant with finance controls.",
    quickLinkGroups: ["operations"],
  },
  vendors: {
    crumb: "Vendors",
    title: "Vendors",
    description:
      "Nurture supplier relationships, track risk, and share procurement-ready data with finance.",
    quickLinkGroups: ["catalogue", "connectivity"],
  },
  integrations: {
    crumb: "Integrations",
    title: "PunchOut & integrations",
    description:
      "Connect ERPs, AP automation, and punchout storefronts so purchasing flows straight into finance.",
    quickLinkGroups: ["connectivity", "operations", "catalogue"],
  },
  settings: {
    crumb: "Settings",
    title: "Settings",
    description:
      "Tune approval thresholds, routing, and automation to reflect procurement policy.",
    quickLinkGroups: ["admin", "operations", "connectivity"],
  },
};

export default function App() {
  const { user, logout: signOut } = useAuth();

  function handleLogout() {
    signOut();
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 md:grid md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden min-h-screen md:flex flex-col border-r border-slate-200 bg-white/90 backdrop-blur">
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600">Procurement</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">Control workspace</div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Purchasing, catalogue, and integrations managed in one place.
          </p>
        </div>
        <nav className="flex-1 space-y-6 px-4 py-5">
          {NAV_GROUPS.map((group) => {
            const groupItems = group.items
              .map((key) => NAV_ITEMS[key])
              .filter(Boolean);

            if (groupItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-2">
                <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                  {group.label}
                </div>
                {group.description ? (
                  <p className="px-3 text-xs leading-relaxed text-slate-500">{group.description}</p>
                ) : null}
                <div className="space-y-1.5">
                  {groupItems.map((item) => (
                    <Nav key={item.to} to={item.to} end={item.end} icon={item.icon}>
                      {item.label}
                    </Nav>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-slate-200 px-6 py-5 text-sm text-slate-600">
          {user ? (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">Signed in</div>
              <div className="truncate font-medium text-slate-700" title={user.email}>
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                <LogOut size={16} strokeWidth={1.75} /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <Link className="inline-flex items-center gap-1 text-blue-700" to="/login">
                <LogIn size={16} strokeWidth={1.75} /> Login
              </Link>
              <Link className="inline-flex items-center gap-1 text-slate-700" to="/signup">
                <UserPlus size={16} strokeWidth={1.75} /> Sign up
              </Link>
            </div>
          )}
          <ThemeToggle />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-600">
                Procurement
              </div>
              <div className="text-base font-semibold text-slate-900">Control workspace</div>
            </div>
            {user ? (
              <div className="flex items-center gap-2 text-xs font-medium">
                <Link
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"
                  to="/app/purchase-orders"
                >
                  POs
                </Link>
                <Link
                  className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
                  to="/app/catalog"
                >
                  Catalog
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link className="text-blue-700" to="/login">
                  Login
                </Link>
                <Link className="text-slate-700" to="/signup">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </header>

        <AnimatedRoutes />
        <footer className="px-4 py-6 text-xs text-slate-500 md:px-8">
          © {new Date().getFullYear()} Procurement workspace
        </footer>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="container mx-auto px-4 py-6 md:px-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
        >
          <Routes location={location}>
            <Route
              index
              element={
                <PageShell>
                  <Dashboard />
                </PageShell>
              }
            />
            <Route
              path="purchase-orders"
              element={
                <PageShell>
                  <PurchaseOrders />
                </PageShell>
              }
            />
            <Route
              path="catalog"
              element={
                <PageShell>
                  <Catalog />
                </PageShell>
              }
            />
            <Route
              path="requests"
              element={
                <PageShell>
                  <Requests />
                </PageShell>
              }
            >
              <Route path=":id" element={<RequestDetailRoute />} />
            </Route>
            <Route
              path="approvals"
              element={
                <PageShell>
                  <Approvals />
                </PageShell>
              }
            />
            <Route
              path="vendors"
              element={
                <PageShell>
                  <Vendors />
                </PageShell>
              }
            />
            <Route
              path="integrations"
              element={
                <PageShell>
                  <Integrations />
                </PageShell>
              }
            />
            <Route
              path="settings"
              element={
                <PageShell>
                  <Settings />
                </PageShell>
              }
            />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div className="space-y-6">
      <Hero />
      {children}
    </div>
  );
}

function Hero() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const segments = pathname.replace(/^\/+/, "").split("/");
  let key = segments[0] || "dashboard";
  if (key === "app") {
    key = segments[1] || "dashboard";
  }
  if (!key) key = "dashboard";
  const meta = HERO_META[key] || HERO_META.dashboard;
  const crumb = meta.crumb || meta.title || key;
  const quickLinkGroups = (meta.quickLinkGroups ?? DEFAULT_QUICK_LINK_GROUPS)
    .map((groupKey) => {
      const group = QUICK_LINK_GROUPS[groupKey];
      if (!group) return null;
      const links = group.items
        .map((itemKey) => NAV_ITEMS[itemKey])
        .filter(Boolean)
        .map((item) => ({
          to: item.to,
          label: item.quickLabel ?? item.label,
          icon: item.icon,
        }));
      if (links.length === 0) return null;
      return { ...group, links };
    })
    .filter(Boolean);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.32em] text-slate-500">Home / {crumb}</div>
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{meta.title || crumb}</h1>
          {meta.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              {meta.description}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 md:max-w-xs">
          <div className="font-semibold text-slate-700">Finance workspace</div>
          <div className="mt-1 text-xs text-slate-500">
            {user?.email ? `Signed in as ${user.email}` : "Sign in to manage purchasing."}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Keep purchase orders, catalogue governance, and integrations aligned so budgets stay on plan.
          </p>
        </div>
      </div>
      {quickLinkGroups.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {quickLinkGroups.map((group) => (
            <section
              key={group.id}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                {group.label}
              </div>
              {group.description ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{group.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <QuickLink key={`${group.id}-${link.to}`} {...link} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Nav({ to, icon: Icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
        (isActive
          ? "bg-blue-50 text-blue-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
      }
    >
      {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
      <span>{children}</span>
    </NavLink>
  );
}

function QuickLink({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {Icon ? <Icon size={14} strokeWidth={1.75} /> : null}
      {label}
    </Link>
  );
}
