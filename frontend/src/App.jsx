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
    <div className="page workspace">
      <header className="site-header workspace-header" id="top">
        <div className="shell nav-shell workspace-nav-shell">
          <Link className="brand workspace-brand" to="/app">
            <span className="brand-mark" aria-hidden="true" />
            <span>Procurement workspace</span>
          </Link>
          <nav className="workspace-nav" aria-label="Workspace navigation">
            {Object.values(NAV_ITEMS).map((item) => (
              <Nav key={item.to} to={item.to} end={item.end} icon={item.icon}>
                {item.label}
              </Nav>
            ))}
          </nav>
          <div className="workspace-actions">
            {user ? (
              <div className="workspace-user" title={user.email}>
                <span className="workspace-user-email">{user.email}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="button outline workspace-signout"
                >
                  <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="workspace-auth">
                <Link className="workspace-auth-link" to="/login">
                  <LogIn size={16} strokeWidth={1.75} aria-hidden="true" />
                  Sign in
                </Link>
                <Link className="button primary" to="/signup">
                  <UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />
                  Create account
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="workspace-main">
        <div className="shell workspace-shell">
          <div className="workspace-grid">
            <aside className="workspace-sidebar" aria-label="Workspace sections">
              {NAV_GROUPS.map((group) => {
                const groupItems = group.items
                  .map((key) => NAV_ITEMS[key])
                  .filter(Boolean);

                if (groupItems.length === 0) return null;

                return (
                  <section key={group.id} className="workspace-sidebar-group">
                    <div className="workspace-sidebar-kicker">{group.label}</div>
                    {group.description ? (
                      <p className="workspace-sidebar-description">{group.description}</p>
                    ) : null}
                    <div className="workspace-sidebar-links">
                      {groupItems.map((item) => (
                        <SidebarLink
                          key={`sidebar-${item.to}`}
                          to={item.to}
                          end={item.end}
                          icon={item.icon}
                        >
                          {item.label}
                        </SidebarLink>
                      ))}
                    </div>
                  </section>
                );
              })}
            </aside>
            <div className="workspace-content">
              <section className="workspace-hero-wrapper">
                <Hero />
              </section>
              <AnimatedRoutes />
            </div>
          </div>
        </div>
      </main>

      <footer className="workspace-footer">
        <div className="shell">© {new Date().getFullYear()} Procurement workspace</div>
      </footer>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="workspace-route-area">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.18, ease: "easeIn" } }}
          className="workspace-route-frame"
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
  return <section className="workspace-surface">{children}</section>;
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
    <div className="workspace-hero-card">
      <div className="workspace-hero-body">
        <div className="workspace-hero-copy">
          <div className="workspace-hero-crumb">Workspace / {crumb}</div>
          <h1 className="workspace-hero-title">{meta.title || crumb}</h1>
          {meta.description ? (
            <p className="workspace-hero-description">{meta.description}</p>
          ) : null}
        </div>
        <div className="workspace-hero-panel">
          <div className="workspace-hero-panel-title">Finance workspace</div>
          <div className="workspace-hero-panel-meta">
            {user?.email ? `Signed in as ${user.email}` : "Sign in to manage purchasing."}
          </div>
          <p className="workspace-hero-panel-description">
            Keep purchase orders, catalogue governance, and integrations aligned so budgets stay on plan.
          </p>
        </div>
      </div>
      {quickLinkGroups.length > 0 ? (
        <div className="workspace-hero-links">
          {quickLinkGroups.map((group) => (
            <section key={group.id} className="workspace-quick-link-group">
              <div className="workspace-quick-link-kicker">{group.label}</div>
              {group.description ? (
                <p className="workspace-quick-link-description">{group.description}</p>
              ) : null}
              <div className="workspace-quick-link-row">
                {group.links.map((link) => (
                  <QuickLink key={`${group.id}-${link.to}`} {...link} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Nav({ to, icon: Icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `workspace-nav-link${isActive ? " active" : ""}`
      }
    >
      {Icon ? <Icon size={18} strokeWidth={1.75} aria-hidden="true" /> : null}
      <span>{children}</span>
    </NavLink>
  );
}

function SidebarLink({ to, icon: Icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `workspace-sidebar-link${isActive ? " active" : ""}`
      }
    >
      {Icon ? <Icon size={16} strokeWidth={1.6} aria-hidden="true" /> : null}
      <span>{children}</span>
    </NavLink>
  );
}

function QuickLink({ to, label, icon: Icon }) {
  return (
    <Link to={to} className="workspace-quick-link">
      {Icon ? <Icon size={14} strokeWidth={1.75} aria-hidden="true" /> : null}
      <span>{label}</span>
    </Link>
  );
}
