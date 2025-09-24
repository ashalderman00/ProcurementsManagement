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
  const punchoutCount = CONNECTORS.filter((connector) => connector.type === "punchout").length;
  const automationCount = AUTOMATIONS.length;
  const cadences = Array.from(new Set(CONNECTORS.map((connector) => connector.cadence).filter(Boolean)));
  const cadenceSummary = cadences.join(" • ");

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

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}
