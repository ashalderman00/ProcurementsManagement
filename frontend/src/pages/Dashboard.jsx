import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  FileSpreadsheet,
  Boxes,
  Workflow,
  Globe2,
  CheckSquare,
  Handshake,
  Cog,
} from "lucide-react";
import { apiGet } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/Card";
import Counter from "../components/Counter";
import Badge from "../components/Badge";

const QUICK_ACTIONS = [
  {
    title: "Raise a purchase order",
    description:
      "Turn approved requests into supplier-ready documents with full audit trails.",
    to: "/app/purchase-orders",
    icon: FileSpreadsheet,
  },
  {
    title: "Curate the catalogue",
    description:
      "Publish preferred items, pricing, and accounting codes for compliant shopping.",
    to: "/app/catalog",
    icon: Boxes,
  },
  {
    title: "Launch PunchOut session",
    description:
      "Shop supplier storefronts via cXML or OCI without leaving the workspace.",
    to: "/app/integrations#punchout",
    icon: Globe2,
  },
  {
    title: "Review integration feed",
    description:
      "Keep ERPs and AP automation synced with purchase orders and receipts.",
    to: "/app/integrations#automation",
    icon: Workflow,
  },
];

const CONNECTOR_SUMMARY = [
  {
    id: "punchout",
    name: "PunchOut storefronts",
    status: "Enabled",
    description:
      "Launch supplier sites and return carts straight into requisitions without breaking approvals.",
    detail:
      "Active suppliers span technology, office, and facilities partners using cXML and OCI standards.",
    icon: Globe2,
  },
  {
    id: "erp",
    name: "ERP & AP sync",
    status: "Connected",
    description:
      "Automatically push approved purchase orders and receipts into NetSuite, SAP, or Oracle.",
    detail: "30-minute exports keep finance, AP automation, and suppliers aligned.",
    icon: Workflow,
  },
  {
    id: "warehouse",
    name: "Data warehouse feed",
    status: "Scheduled",
    description:
      "Nightly SFTP and API feeds share spend, vendor, and receipt data with finance analytics.",
    detail: "Delivered to Snowflake and Power BI with change logs for auditors.",
    icon: FileSpreadsheet,
  },
  {
    id: "automation",
    name: "Automation webhooks",
    status: "Ready",
    description:
      "Notify budget owners, approvers, and suppliers in real time when purchasing milestones change.",
    detail: "Supports Slack, Teams, and custom webhooks for downstream workflows.",
    icon: Workflow,
  },
];

export default function Dashboard() {
  const [reqs, setReqs] = useState([]);
  const [cats, setCats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const results = await Promise.allSettled([
          apiGet("/api/requests"),
          apiGet("/api/categories"),
          apiGet("/api/orders"),
          apiGet("/api/vendors"),
        ]);
        if (!active) return;
        const [requestsRes, categoriesRes, ordersRes, vendorsRes] = results;
        setReqs(
          requestsRes.status === "fulfilled" && Array.isArray(requestsRes.value)
            ? requestsRes.value
            : []
        );
        setCats(
          categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)
            ? categoriesRes.value
            : []
        );
        setOrders(
          ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)
            ? ordersRes.value
            : []
        );
        setVendors(
          vendorsRes.status === "fulfilled" && Array.isArray(vendorsRes.value)
            ? vendorsRes.value
            : []
        );
      } catch (err) {
        console.warn("Failed to load dashboard data", err);
        if (!active) return;
        setReqs([]);
        setCats([]);
        setOrders([]);
        setVendors([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categoryById = useMemo(() => {
    const map = new Map();
    cats.forEach((cat) => {
      const id = Number(cat?.id);
      if (!Number.isNaN(id)) {
        map.set(id, cat);
      }
    });
    return map;
  }, [cats]);

  const kpi = useMemo(() => ({
    total: reqs.length,
    approved: reqs.filter((r) => normalizeStatus(r.status) === "approved").length,
    pending: reqs.filter((r) => normalizeStatus(r.status) === "pending").length,
    denied: reqs.filter((r) => normalizeStatus(r.status) === "denied").length,
  }), [reqs]);

  const spendTotals = useMemo(() => {
    return reqs.reduce(
      (acc, req) => {
        const amount = toNumber(req?.amount);
        acc.requested += amount;
        const status = normalizeStatus(req?.status);
        if (status === "approved") acc.approved += amount;
        if (status === "pending") acc.pending += amount;
        return acc;
      },
      { requested: 0, approved: 0, pending: 0 }
    );
  }, [reqs]);

  const orderStats = useMemo(() => {
    const stats = {
      total: 0,
      open: 0,
      receiving: 0,
      closed: 0,
      cancelled: 0,
      committed: 0,
      dueSoon: 0,
      late: 0,
    };
    const now = new Date();
    const soon = new Date(now);
    soon.setDate(now.getDate() + 7);
    const openStatuses = new Set([
      "draft",
      "pending",
      "awaiting-approval",
      "issued",
      "sent",
    ]);
    const receivingStatuses = new Set([
      "receiving",
      "partially-received",
      "partial",
    ]);
    const closedStatuses = new Set([
      "received",
      "closed",
      "complete",
      "completed",
      "fulfilled",
    ]);
    const cancelledStatuses = new Set(["cancelled", "void", "rejected"]);

    orders.forEach((order) => {
      stats.total += 1;
      const status = normalizeStatus(getOrderStatus(order));
      const total = getOrderTotal(order);
      stats.committed += total;

      if (receivingStatuses.has(status)) {
        stats.receiving += 1;
        stats.open += 1;
      } else if (closedStatuses.has(status)) {
        stats.closed += 1;
      } else if (cancelledStatuses.has(status)) {
        stats.cancelled += 1;
      } else if (openStatuses.has(status) || !status) {
        stats.open += 1;
      }

      const expected = getExpectedDate(order);
      if (expected) {
        if (expected < now && !closedStatuses.has(status) && !cancelledStatuses.has(status)) {
          stats.late += 1;
        } else if (expected >= now && expected <= soon) {
          stats.dueSoon += 1;
        }
      }
    });

    return stats;
  }, [orders]);

  const categoryTotals = useMemo(() => {
    const totals = new Map();
    reqs.forEach((req) => {
      const categoryId =
        req?.category_id !== undefined && req?.category_id !== null
          ? Number(req.category_id)
          : null;
      const category = categoryId !== null ? categoryById.get(categoryId) : null;
      const name = category?.name || req?.category_name || "Uncategorised";
      const key = categoryId ?? name;
      const entry = totals.get(key) || {
        name,
        amount: 0,
        count: 0,
        categoryId,
      };
      entry.amount += toNumber(req?.amount);
      entry.count += 1;
      totals.set(key, entry);
    });

    return Array.from(totals.values())
      .map((entry) => {
        const source =
          entry.categoryId !== null ? categoryById.get(entry.categoryId) : null;
        const itemCount = safeNumber(
          source?.item_count ??
            source?.items_count ??
            (Array.isArray(source?.items) ? source.items.length : 0)
        );
        return { ...entry, itemCount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [reqs, categoryById]);

  const requestedTotal = spendTotals.requested;
  const topCategories = useMemo(() => {
    return categoryTotals.slice(0, 4).map((entry) => ({
      ...entry,
      percent:
        requestedTotal > 0
          ? Math.round((entry.amount / requestedTotal) * 100)
          : 0,
    }));
  }, [categoryTotals, requestedTotal]);

  const recent = useMemo(() => {
    return [...reqs]
      .sort(
        (a, b) =>
          getTimestamp(b?.updated_at || b?.created_at) -
          getTimestamp(a?.updated_at || a?.created_at)
      )
      .slice(0, 5);
  }, [reqs]);

  const readyForPo = useMemo(() => {
    return reqs
      .filter((req) => normalizeStatus(req.status) === "approved")
      .sort(
        (a, b) =>
          getTimestamp(b?.updated_at || b?.created_at) -
          getTimestamp(a?.updated_at || a?.created_at)
      )
      .slice(0, 5);
  }, [reqs]);

  const highlightedRequests = useMemo(() => {
    const base = readyForPo.length ? readyForPo : recent;
    return base.map((req) => ({
      ...req,
      categoryLabel: resolveCategoryName(req, categoryById),
    }));
  }, [readyForPo, recent, categoryById]);

  const highlightTitle = readyForPo.length
    ? "Requests ready for purchase orders"
    : "Recent requests";
  const highlightSubtitle = readyForPo.length
    ? "Convert approvals into committed spend"
    : "Latest purchasing activity across teams";

  const vendorCount = Array.isArray(vendors) ? vendors.length : 0;

  const sections = [
    {
      id: "overview",
      label: "Overview",
      description:
        "Monitor spend commitments, catalogue health, and supplier activity across procurement.",
    },
    {
      id: "requests",
      label: "Requests",
      description:
        "Track intake demand, approvals, and purchase order readiness in one place.",
    },
    {
      id: "administration",
      label: "Administration",
      description:
        "Manage catalogue governance, supplier relationships, and system integrations.",
    },
  ];

  const activeMeta =
    sections.find((section) => section.id === activeSection) ?? sections[0];

  let sectionContent;
  switch (activeMeta.id) {
    case "requests":
      sectionContent = (
        <RequestsPanel
          kpi={kpi}
          spendTotals={spendTotals}
          highlightedRequests={highlightedRequests}
          highlightTitle={highlightTitle}
          highlightSubtitle={highlightSubtitle}
          readyForPo={readyForPo}
          loading={loading}
          topCategories={topCategories}
        />
      );
      break;
    case "administration":
      sectionContent = (
        <AdministrationPanel
          kpi={kpi}
          vendorCount={vendorCount}
          categoryCount={cats.length}
        />
      );
      break;
    default:
      sectionContent = (
        <OverviewPanel
          kpi={kpi}
          orderStats={orderStats}
          categoryCount={cats.length}
          vendorCount={vendorCount}
        />
      );
      break;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-800">Workspace focus</div>
            <p className="text-xs text-slate-500 md:max-w-md">{activeMeta.description}</p>
          </div>
          <SectionToggle
            sections={sections}
            activeId={activeMeta.id}
            onSelect={setActiveSection}
          />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMeta.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-8"
        >
          {sectionContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewPanel({ kpi, orderStats, categoryCount, vendorCount }) {
  return (
    <div className="space-y-8">
      <WorkspaceKpis
        kpi={kpi}
        orderStats={orderStats}
        categoryCount={categoryCount}
        vendorCount={vendorCount}
      />
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <PurchaseOrdersCard orderStats={orderStats} kpi={kpi} />
        <QuickActionsCard />
      </section>
    </div>
  );
}

function RequestsPanel({
  kpi,
  spendTotals,
  highlightedRequests,
  highlightTitle,
  highlightSubtitle,
  readyForPo,
  loading,
  topCategories,
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <RequestPipelineCard kpi={kpi} spendTotals={spendTotals} />
        <RequestHighlightsCard
          highlightedRequests={highlightedRequests}
          highlightTitle={highlightTitle}
          highlightSubtitle={highlightSubtitle}
          readyForPo={readyForPo}
          loading={loading}
        />
      </section>
      <CatalogueCoverageCard topCategories={topCategories} loading={loading} />
    </div>
  );
}

function AdministrationPanel({ kpi, vendorCount, categoryCount }) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <IntegrationsCard />
        <GovernanceCard
          kpi={kpi}
          vendorCount={vendorCount}
          categoryCount={categoryCount}
        />
      </section>
    </div>
  );
}

function WorkspaceKpis({ kpi, orderStats, categoryCount, vendorCount }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        title="Open purchase orders"
        value={orderStats.open}
        hint="Draft, pending, or issued"
      />
      <Kpi
        title="Requests pending approval"
        value={kpi.pending}
        hint="Require finance or stakeholder review"
      />
      <Kpi
        title="Active catalogue categories"
        value={categoryCount}
        hint="Published for compliant shopping"
      />
      <Kpi
        title="Active suppliers"
        value={vendorCount}
        hint="Engaged in recent purchasing"
      />
    </section>
  );
}

function PurchaseOrdersCard({ orderStats, kpi }) {
  return (
    <Card>
      <CardHeader
        title="Purchase orders at a glance"
        subtitle="Finance-critical visibility into spend commitments"
        actions={
          <Link
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            to="/app/purchase-orders"
          >
            View register <ArrowUpRight size={16} />
          </Link>
        }
      />
      <CardBody className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile
            label="Open"
            value={orderStats.open}
            description="Draft, pending approval, or issued"
          />
          <SummaryTile
            label="Receiving"
            value={orderStats.receiving}
            description="Awaiting goods receipt"
          />
          <SummaryTile
            label="Closed"
            value={orderStats.closed}
            description="Fully received and reconciled"
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Committed spend
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {formatCurrency(orderStats.committed)}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Derived from {kpi.approved} approved request
                {kpi.approved === 1 ? "" : "s"} ready for PO creation.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-600 sm:min-w-[220px]">
              <StatusLine
                label="Due in the next 7 days"
                value={orderStats.dueSoon}
              />
              <StatusLine
                label="Past-due receipts"
                value={orderStats.late}
                highlight
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader
        title="Procurement quick actions"
        subtitle="Keep purchasing moving fast"
      />
      <CardBody className="space-y-3">
        {QUICK_ACTIONS.map((action) => (
          <ActionRow key={action.title} {...action} />
        ))}
      </CardBody>
    </Card>
  );
}

function RequestPipelineCard({ kpi, spendTotals }) {
  const tiles = [
    {
      key: "submitted",
      label: "Submitted",
      value: kpi.total,
      description: `${formatCurrency(spendTotals.requested)} requested`,
    },
    {
      key: "approved",
      label: "Approved",
      value: kpi.approved,
      description: `${formatCurrency(spendTotals.approved)} approved`,
    },
    {
      key: "pending",
      label: "Pending",
      value: kpi.pending,
      description: `${formatCurrency(spendTotals.pending)} awaiting review`,
    },
  ];

  const deniedCopy = kpi.denied
    ? `${kpi.denied} request${kpi.denied === 1 ? "" : "s"} denied`
    : "No denials this period";

  const readinessCopy = kpi.approved
    ? `${kpi.approved} approval${kpi.approved === 1 ? "" : "s"} are ready for purchase orders.`
    : "As approvals arrive, requests ready for purchase orders will surface here.";

  return (
    <Card>
      <CardHeader
        title="Request pipeline"
        subtitle="Understand demand volume and approval readiness"
      />
      <CardBody className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {tiles.map((tile) => (
            <SummaryTile
              key={tile.key}
              label={tile.label}
              value={tile.value}
              description={tile.description}
            />
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700">{readinessCopy}</div>
          <p className="mt-1">{deniedCopy}.</p>
        </div>
      </CardBody>
    </Card>
  );
}

function CatalogueCoverageCard({ topCategories, loading }) {
  return (
    <Card>
      <CardHeader
        title="Catalogue coverage"
        subtitle="Track high-impact categories and catalogue readiness"
        actions={
          <Link
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            to="/app/catalog"
          >
            Manage catalogue <ArrowUpRight size={16} />
          </Link>
        }
      />
      <CardBody className="space-y-4">
        {topCategories.length ? (
          topCategories.map((cat) => <CategoryRow key={cat.name} {...cat} />)
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            {loading
              ? "Loading catalogue insight…"
              : "Catalogue activity will appear here as soon as requests reference approved categories."}
          </div>
        )}
        <div className="rounded-xl bg-white/60 px-4 py-3 text-xs text-slate-500">
          Publish vendor-managed feeds or punchout links from the catalogue workspace to steer compliant buying.
        </div>
      </CardBody>
    </Card>
  );
}

function IntegrationsCard() {
  return (
    <Card>
      <CardHeader
        title="Integration & automation"
        subtitle="Connect purchasing to finance, ERP, and analytics"
        actions={
          <Link
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            to="/app/integrations"
          >
            Manage integrations <ArrowUpRight size={16} />
          </Link>
        }
      />
      <CardBody className="space-y-3">
        {CONNECTOR_SUMMARY.map((connector) => (
          <ConnectorRow key={connector.id} {...connector} />
        ))}
      </CardBody>
    </Card>
  );
}

function RequestHighlightsCard({
  highlightedRequests,
  highlightTitle,
  highlightSubtitle,
  readyForPo,
  loading,
}) {
  return (
    <Card>
      <CardHeader
        title={highlightTitle}
        subtitle={highlightSubtitle}
        actions={
          readyForPo.length ? (
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
              to="/app/purchase-orders"
            >
              Start PO draft <ArrowUpRight size={16} />
            </Link>
          ) : null
        }
      />
      <CardBody className="space-y-3">
        {highlightedRequests.length ? (
          highlightedRequests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            {loading
              ? "Loading procurement activity…"
              : "Once requests are submitted and approved, they will appear here ready for purchase order creation."}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function GovernanceCard({ kpi, vendorCount, categoryCount }) {
  const approvalMetric = kpi.pending
    ? `${kpi.pending} pending`
    : "All caught up";
  const catalogueMetric = categoryCount
    ? `${categoryCount} active`
    : "Publish catalogue";
  const supplierMetric = vendorCount
    ? `${vendorCount} active`
    : "Invite suppliers";

  const rows = [
    {
      id: "approvals",
      to: "/app/approvals",
      title: "Approval routing",
      description: "Review outstanding approvals and escalate blockers.",
      metric: approvalMetric,
      icon: CheckSquare,
    },
    {
      id: "catalogue",
      to: "/app/catalog",
      title: "Catalogue governance",
      description: "Ensure preferred items and accounting codes stay current.",
      metric: catalogueMetric,
      icon: Boxes,
    },
    {
      id: "vendors",
      to: "/app/vendors",
      title: "Supplier relationships",
      description: "Maintain onboarding data and monitor engagement levels.",
      metric: supplierMetric,
      icon: Handshake,
    },
    {
      id: "settings",
      to: "/app/settings",
      title: "Policies & access",
      description: "Tune approval thresholds, automation, and workspace roles.",
      metric: "Workspace settings",
      icon: Cog,
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Workspace governance"
        subtitle="Keep policies, catalogue, and supplier access aligned"
        actions={
          <Link
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            to="/app/settings"
          >
            Open settings <ArrowUpRight size={16} />
          </Link>
        }
      />
      <CardBody className="space-y-3">
        {rows.map((row) => (
          <GovernanceRow key={row.id} {...row} />
        ))}
      </CardBody>
    </Card>
  );
}

function GovernanceRow({ to, title, description, metric, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/70"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">
          {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-slate-800 group-hover:text-blue-700">{title}</div>
          <p className="text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      <div className="shrink-0 text-xs font-semibold text-slate-600 group-hover:text-blue-700">
        {metric}
      </div>
    </Link>
  );
}

function SectionToggle({ sections, activeId, onSelect }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect?.(section.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {section.label}
          </button>
        );
      })}
    </div>
  );
}

function Kpi({ title, value, hint }) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-slate-900"
        >
          <Counter value={Number(value) || 0} />
        </motion.div>
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </CardBody>
    </Card>
  );
}

function SummaryTile({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>
  );
}

function StatusLine({ label, value, highlight }) {
  const highlightClass = highlight && value
    ? "text-amber-700"
    : "text-slate-800";
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${highlightClass}`}>{value}</span>
    </div>
  );
}

function ActionRow({ to, title, description, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/70"
    >
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">
        {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="font-medium text-slate-800 group-hover:text-blue-700">{title}</div>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
      <ArrowUpRight className="mt-1 hidden flex-none text-blue-500 group-hover:block" size={16} />
    </Link>
  );
}

function CategoryRow({ name, amount, count, percent }) {
  const barWidth = Math.max(0, Math.min(100, percent || 0));
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-800">{name}</span>
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(amount)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{count} request{count === 1 ? "" : "s"}</span>
        <span>{percent}% of spend</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500/80 transition-all"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

function ConnectorRow({ name, description, detail, status, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{name}</span>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const styles = {
    connected: "bg-emerald-100 text-emerald-700",
    enabled: "bg-blue-100 text-blue-700",
    ready: "bg-violet-100 text-violet-700",
    scheduled: "bg-slate-100 text-slate-600",
    planned: "bg-slate-100 text-slate-600",
    "action-required": "bg-amber-100 text-amber-800",
  };
  const className = styles[key] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}

function RequestRow({ request }) {
  const category = request.categoryLabel || request.category_name || "Uncategorised";
  const created = formatDate(request.updated_at || request.created_at);
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="min-w-0 space-y-1">
        <Link
          to={`/app/requests/${request.id}`}
          className="truncate font-medium text-slate-800 hover:text-blue-700"
        >
          {request.title}
        </Link>
        <div className="text-xs text-slate-500">
          {category} • {formatCurrency(request.amount)}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 text-xs text-slate-500">
        <Badge status={request.status} />
        <span>{created}</span>
      </div>
    </div>
  );
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
}

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "$0.00";
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getTimestamp(value) {
  if (!value) return 0;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function getOrderStatus(order) {
  return pickField(order, ["status", "state", "stage"]);
}

function getOrderTotal(order) {
  return toNumber(
    pickField(order, [
      "total",
      "amount",
      "value",
      "grand_total",
      "grandTotal",
    ])
  );
}

function getExpectedDate(order) {
  const raw = pickField(order, [
    "expected_date",
    "expectedDate",
    "due_date",
    "dueDate",
    "delivery_date",
    "deliveryDate",
  ]);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pickField(record, fields) {
  for (const key of fields) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function resolveCategoryName(request, categoryById) {
  const rawId = request?.category_id;
  if (rawId !== undefined && rawId !== null) {
    const id = Number(rawId);
    if (!Number.isNaN(id)) {
      const match = categoryById.get(id);
      if (match?.name) return match.name;
    }
  }
  if (request?.category_name) return request.category_name;
  return "Uncategorised";
}
