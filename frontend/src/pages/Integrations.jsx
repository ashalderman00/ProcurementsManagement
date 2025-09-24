import {
  ArrowUpRight,
  FileSpreadsheet,
  Globe2,
  Workflow,
  Plug,
  Boxes,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/Card";

const CONNECTORS = [
  {
    id: "punchout",
    type: "punchout",
    name: "PunchOut storefronts",
    status: "Enabled",
    cadence: "Real-time",
    description:
      "Launch supplier-hosted catalogues via cXML or OCI, maintain SSO, and return carts directly into requisitions.",
    detail:
      "Includes cart replay, audit logging, and configurable timeouts so finance can trace every PunchOut session.",
    icon: Globe2,
    capabilities: ["cXML + OCI", "SSO handshake", "Cart replay"],
  },
  {
    id: "erp",
    type: "erp",
    name: "ERP & AP automation",
    status: "Connected",
    cadence: "Every 30 min",
    description:
      "Push approved purchase orders, receipts, and change orders into NetSuite, SAP, Oracle, or Workday.",
    detail:
      "Two-way sync keeps supplier confirmations and invoice status aligned with procurement records.",
    icon: Workflow,
    capabilities: ["NetSuite", "SAP", "Oracle", "Workday"],
  },
  {
    id: "ap",
    type: "ap",
    name: "Accounts payable",
    status: "Ready",
    cadence: "Real-time webhooks",
    description:
      "Notify AP automation platforms when receipts clear or when three-way match exceptions occur.",
    detail:
      "Supports Tipalti, Coupa Pay, and custom SFTP drops for payment batches.",
    icon: Plug,
    capabilities: ["Tipalti", "Coupa Pay", "Custom SFTP"],
  },
  {
    id: "analytics",
    type: "data",
    name: "Analytics & data warehouse",
    status: "Scheduled",
    cadence: "Nightly",
    description:
      "Export purchasing, supplier, and receipt data to Snowflake, Power BI, or BigQuery for finance analytics.",
    detail:
      "Incremental loads include delta flags, cost center splits, and approval history for downstream reporting.",
    icon: Boxes,
    capabilities: ["Snowflake", "Power BI", "BigQuery"],
  },
];

const PUNCHOUT_SUPPLIERS = [
  {
    id: "staples",
    name: "Staples Advantage",
    status: "Enabled",
    protocol: "cXML",
    sso: "SAML SSO",
    sessionCount: 148,
    successRate: 0.992,
    avgReturnSeconds: 95,
    lastCart: isoHoursAgo(4),
    coverage: ["Office supplies", "Facilities", "Janitorial"],
    notes:
      "Routes cart accounting splits to facilities cost centres and enforces contract pricing before submission.",
  },
  {
    id: "cdw",
    name: "CDW Technology",
    status: "Enabled",
    protocol: "cXML",
    sso: "OAuth SSO",
    sessionCount: 96,
    successRate: 0.987,
    avgReturnSeconds: 110,
    lastCart: isoHoursAgo(8),
    coverage: ["Laptops & hardware", "Peripherals", "Software renewals"],
    notes:
      "Maps requester identity through OAuth, then returns carts with asset tags and warranty SKUs attached.",
  },
  {
    id: "grainger",
    name: "Grainger",
    status: "In progress",
    protocol: "OCI",
    sso: "SAML SSO",
    sessionCount: 42,
    successRate: 0.978,
    avgReturnSeconds: 138,
    lastCart: isoHoursAgo(26),
    coverage: ["MRO", "Safety", "Facilities"],
    notes:
      "User acceptance testing covers multi-ship-to carts and budget checks before enabling for all requesters.",
  },
];

const AUTOMATIONS = [
  {
    title: "REST & GraphQL APIs",
    description:
      "Programmatically create requests, issue purchase orders, manage catalogue content, and sync vendor records.",
    icon: Workflow,
  },
  {
    title: "Webhooks & events",
    description:
      "Receive instant notifications when requests are approved, purchase orders are sent, or receipts are posted.",
    icon: Plug,
  },
  {
    title: "EDI & cXML messaging",
    description:
      "Exchange 850/855/856 documents, confirmations, and ship notices with suppliers to minimise manual follow-up.",
    icon: Globe2,
  },
  {
    title: "Scheduled exports",
    description:
      "Deliver CSV, SFTP, or cloud-storage feeds on custom cadences for finance, FP&A, and audit teams.",
    icon: FileSpreadsheet,
  },
];

const PLAYBOOK = [
  "Connect finance systems first so approved purchase orders land where budgets live.",
  "Enable punchout storefronts for preferred suppliers to keep shopping compliant.",
  "Subscribe to webhook alerts for high-value approvals and policy exceptions.",
  "Schedule data warehouse exports to keep analytics and forecasting up to date.",
];

export default function Integrations() {
  const connectedCount = CONNECTORS.filter((connector) =>
    ["connected", "enabled", "ready"].includes(normalizeStatus(connector.status))
  ).length;
  const punchoutSuppliers = PUNCHOUT_SUPPLIERS;
  const punchoutCount = punchoutSuppliers.length
    ? punchoutSuppliers.length
    : CONNECTORS.filter((connector) => connector.type === "punchout").length;
  const automationCount = AUTOMATIONS.length;
  const cadences = Array.from(new Set(CONNECTORS.map((connector) => connector.cadence).filter(Boolean)));
  const cadenceSummary = cadences.join(" • ");

  const activePunchout = punchoutSuppliers.filter((supplier) =>
    ["connected", "enabled"].includes(normalizeStatus(supplier.status))
  ).length;
  const punchoutSessions = punchoutSuppliers.reduce(
    (sum, supplier) => sum + toNumber(supplier.sessionCount),
    0
  );
  const averageReturnSeconds = average(
    punchoutSuppliers.map((supplier) => toNumber(supplier.avgReturnSeconds))
  );
  const averageSuccessRate = average(
    punchoutSuppliers.map((supplier) => toNumber(supplier.successRate))
  );
  const protocols = Array.from(
    new Set(punchoutSuppliers.map((supplier) => supplier.protocol).filter(Boolean))
  );
  const ssoMethods = Array.from(
    new Set(punchoutSuppliers.map((supplier) => supplier.sso).filter(Boolean))
  );
  const handshakeSummary = [
    protocols.length ? `Protocols: ${protocols.join(" • ")}` : "",
    ssoMethods.length ? `SSO: ${ssoMethods.join(" • ")}` : "",
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Integration overview"
          subtitle="Keep procurement, finance, and suppliers connected without manual reconciliation"
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <IntegrationMetric label="Connected systems" value={connectedCount} />
            <IntegrationMetric label="PunchOut storefronts" value={punchoutCount} />
            <IntegrationMetric label="Automation recipes" value={automationCount} />
            <IntegrationMetric label="Delivery cadence" value={cadenceSummary || "Configurable"} isText />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Automations prioritise purchase orders, catalogue governance, and supplier collaboration so finance has a
            single source of truth.
          </p>
        </CardBody>
      </Card>

      <Card id="punchout">
        <CardHeader
          title="PunchOut integration hub"
          subtitle="Monitor supplier storefronts, protocols, and session performance"
          actions={
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
              to="/app/catalog"
            >
              Map categories <ArrowUpRight size={16} />
            </Link>
          }
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <IntegrationMetric label="Active PunchOut suppliers" value={activePunchout} />
            <IntegrationMetric label="Monthly sessions" value={punchoutSessions} />
            <IntegrationMetric
              label="Avg cart return"
              value={averageReturnSeconds ? formatDuration(averageReturnSeconds) : "Calibrating"}
              isText
            />
            <IntegrationMetric
              label="Success rate"
              value={averageSuccessRate ? formatPercent(averageSuccessRate) : "Tracking"}
              isText
            />
          </div>
          {handshakeSummary && (
            <div className="text-xs text-blue-700">{handshakeSummary}</div>
          )}
          <div className="space-y-3">
            {punchoutSuppliers.map((supplier) => (
              <PunchoutConnectorRow key={supplier.id} connector={supplier} />
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-4 py-3 text-xs text-blue-700">
            cXML transaction logs and OCI sessions are archived for 90 days. Download transcripts from the integration audit
            log before closing the month-end checklist.
          </div>
        </CardBody>
      </Card>

      <Card id="connectors">
        <CardHeader
          title="Connectors"
          subtitle="Certified integrations for punchout, ERP, AP automation, and analytics"
          actions={
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
              to="/app/purchase-orders"
            >
              Send a test PO <ArrowUpRight size={16} />
            </Link>
          }
        />
        <CardBody className="space-y-3">
          {CONNECTORS.map((connector) => (
            <ConnectorRow key={connector.id} connector={connector} />
          ))}
        </CardBody>
      </Card>

      <Card id="automation">
        <CardHeader
          title="Integration & automation toolkit"
          subtitle="Build workflows and analytics pipelines around purchasing"
          actions={
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
              to="/app/catalog"
            >
              Sync catalogue <ArrowUpRight size={16} />
            </Link>
          }
        />
        <CardBody className="space-y-3">
          {AUTOMATIONS.map((item) => (
            <AutomationRow key={item.title} item={item} />
          ))}
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500">
            Need custom endpoints or credentials? Contact the integrations team for sandbox access and API keys.
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Integration playbook"
          subtitle="Sequence the rollout so purchasing and finance stay in lockstep"
        />
        <CardBody className="space-y-4 text-sm text-slate-600">
          <ol className="list-decimal list-inside space-y-3">
            {PLAYBOOK.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Monitor integration health from the dashboard and review audit logs before closing the month.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function IntegrationMetric({ label, value, isText }) {
  const display = isText ? value : Number(value) || 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {isText ? display : display.toLocaleString()}
      </div>
    </div>
  );
}

function ConnectorRow({ connector }) {
  const { icon: Icon, name, status, cadence, description, detail, capabilities } = connector;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-800">{name}</span>
          <StatusBadge status={status} />
          {cadence && <span className="text-xs text-slate-500">{cadence}</span>}
        </div>
        <p className="text-sm text-slate-600">{description}</p>
        {Array.isArray(capabilities) && capabilities.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-xs text-slate-500">
            {capabilities.map((capability) => (
              <li key={capability} className="rounded-full bg-slate-100 px-2 py-1">
                {capability}
              </li>
            ))}
          </ul>
        )}
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </div>
  );
}

function PunchoutConnectorRow({ connector }) {
  const { name, status, protocol, sso, sessionCount, successRate, avgReturnSeconds, lastCart, coverage, notes } = connector;
  const sessions = toNumber(sessionCount);
  const success = toNumber(successRate);
  const returnSeconds = toNumber(avgReturnSeconds);
  const coverageList = ensureArray(coverage);

  return (
    <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-blue-800">{name}</span>
          <StatusBadge status={status} />
        </div>
        <span className="text-xs text-blue-700">
          {protocol}
          {sso ? ` • ${sso}` : ""}
        </span>
      </div>
      {notes ? <p className="text-sm text-blue-700">{notes}</p> : null}
      <div className="flex flex-wrap items-center gap-3 text-xs text-blue-700">
        <span>
          {sessions > 0
            ? `${sessions.toLocaleString()} session${sessions === 1 ? "" : "s"} this month`
            : "Enable tracking to start sessions"}
        </span>
        {success > 0 ? <span>{formatPercent(success)} success</span> : <span>Success metrics pending</span>}
        {returnSeconds > 0 ? (
          <span>{formatDuration(returnSeconds)} avg cart return</span>
        ) : (
          <span>Cart return tests pending</span>
        )}
        <span>Last cart {formatRelativeTime(lastCart)}</span>
      </div>
      {coverageList.length ? (
        <ul className="flex flex-wrap gap-2 text-xs text-blue-700">
          {coverageList.map((item) => (
            <li key={item} className="rounded-full bg-white/60 px-2 py-1">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AutomationRow({ item }) {
  const { icon: Icon, title, description } = item;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {Icon ? <Icon size={18} strokeWidth={1.75} /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-800">{title}</div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const classes = {
    connected: "bg-emerald-100 text-emerald-700",
    enabled: "bg-blue-100 text-blue-700",
    ready: "bg-violet-100 text-violet-700",
    scheduled: "bg-slate-100 text-slate-600",
    "in-progress": "bg-amber-100 text-amber-800",
  };
  const className = classes[key] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}

function average(values) {
  const filtered = values.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0);
  if (!filtered.length) return 0;
  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function formatDuration(seconds) {
  const totalSeconds = Math.round(Number(seconds));
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "";
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = totalSeconds % 60;
  if (minutes <= 0) {
    return `${remaining}s`;
  }
  return `${minutes}m ${remaining.toString().padStart(2, "0")}s`;
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  const percentage = number > 1 ? number : number * 100;
  return `${percentage.toFixed(1)}%`;
}

function formatRelativeTime(value) {
  if (!value) return "not yet recorded";
  const date = new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) return "not yet recorded";
  const diffMs = Date.now() - time;
  if (diffMs <= 0) return "just now";
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isoHoursAgo(hours) {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() - Number(hours || 0));
  return date.toISOString();
}
