import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Boxes,
  FileSpreadsheet,
  Globe2,
  Workflow,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../components/Card";
import { apiGet } from "../lib/api";

export default function Catalog() {
  const [rawCategories, setRawCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const response = await apiGet("/api/categories");
        if (!active) return;
        setRawCategories(Array.isArray(response) ? response : []);
      } catch (err) {
        console.warn("Failed to load categories", err);
        if (!active) return;
        setRawCategories([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    return rawCategories
      .map((category, index) => {
        const itemCount = safeNumber(
          category?.item_count ??
            category?.items_count ??
            category?.itemCount ??
            (Array.isArray(category?.items) ? category.items.length : 0)
        );
        const punchoutUrl =
          category?.punchout_url ??
          category?.punchoutUrl ??
          category?.punchout?.url ??
          "";
        const lastUpdated =
          category?.updated_at ??
          category?.updatedAt ??
          category?.modified_at ??
          category?.modifiedAt ??
          category?.created_at ??
          category?.createdAt ??
          "";
        return {
          id: category?.id ?? index,
          name: category?.name || `Category ${index + 1}`,
          itemCount,
          punchoutUrl,
          lastUpdated,
          owner: category?.owner ?? category?.managed_by ?? "",
        };
      })
      .sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name));
  }, [rawCategories]);

  const totalItems = categories.reduce((sum, cat) => sum + cat.itemCount, 0);
  const punchoutCategories = categories.filter((cat) => Boolean(cat.punchoutUrl));
  const lastUpdatedTimestamp = categories.reduce(
    (latest, cat) => {
      const ts = getTimestamp(cat.lastUpdated);
      return ts > latest ? ts : latest;
    },
    0
  );

  const summary = {
    activeCategories: categories.length,
    totalItems,
    punchoutCount: punchoutCategories.length,
    lastUpdatedLabel: lastUpdatedTimestamp
      ? formatDate(new Date(lastUpdatedTimestamp))
      : "No updates recorded",
  };

  const displayCategories = categories.slice(0, 8);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Catalogue health"
          subtitle="Ensure buyers see the right items, pricing, and supplier experiences"
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={Boxes}
              label="Active categories"
              value={summary.activeCategories}
            />
            <Metric
              icon={FileSpreadsheet}
              label="Catalogue items"
              value={summary.totalItems}
            />
            <Metric
              icon={Globe2}
              label="PunchOut connectors"
              value={summary.punchoutCount}
            />
            <Metric
              icon={Workflow}
              label="Last update"
              value={summary.lastUpdatedLabel}
              isText
            />
          </div>
          <p className="text-sm text-slate-600">
            Keep pricing current, enrich categories with accounting data, and publish only after finance
            review. Vendor-managed feeds and punchout storefronts can be activated from the integrations hub.
          </p>
        </CardBody>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title="Category coverage"
            subtitle="Curated content that drives compliant purchasing"
            actions={
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
                to="/app/requests"
              >
                View demand <ArrowUpRight size={16} />
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {displayCategories.length ? (
              displayCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                {loading
                  ? "Loading catalogue…"
                  : "Create a category or import a vendor feed to start building your procurement catalogue."}
              </div>
            )}
            {categories.length > displayCategories.length && (
              <div className="text-xs text-slate-500">
                Showing the first {displayCategories.length} categories by item count. Manage the full list in
                the catalogue workspace.
              </div>
            )}
          </CardBody>
        </Card>

        <Card id="punchout">
          <CardHeader
            title="PunchOut & supplier sites"
            subtitle="Launch external storefronts without breaking the approval process"
            actions={
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
                to="/app/integrations#punchout"
              >
                Configure connectors <ArrowUpRight size={16} />
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {punchoutCategories.length ? (
              punchoutCategories.map((category) => (
                <PunchoutRow key={category.id} category={category} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                {loading
                  ? "Checking for punchout connectors…"
                  : "Connect a supplier punchout storefront so buyers can shop on vendor websites and return carts automatically."}
              </div>
            )}
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
              Support cXML and OCI punchout flows with SSO, transaction logs, and automatic cart return into
              requisitions.
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader
          title="Content management playbook"
          subtitle="Keep catalogue data finance-ready and audit compliant"
        />
        <CardBody className="space-y-4 text-sm text-slate-600">
          <ol className="list-decimal list-inside space-y-3">
            <li>Review vendor-managed feeds each week and publish updates after finance sign-off.</li>
            <li>Tag items with category, cost center, and budget codes before making them visible to requesters.</li>
            <li>Use draft states to stage large updates and share preview links with stakeholders for feedback.</li>
            <li>Activate punchout connectors when catalogue coverage is insufficient or pricing is dynamic.</li>
          </ol>
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500">
            Automate imports and publish workflows through the <Link className="text-blue-700" to="/app/integrations#automation">integrations hub</Link> to keep finance systems synchronized.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value, isText }) {
  const display = isText ? value : Number(value) || 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {Icon ? <Icon size={14} strokeWidth={1.75} /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {isText ? display : display.toLocaleString()}
      </div>
    </div>
  );
}

function CategoryRow({ category }) {
  const { name, itemCount, punchoutUrl, lastUpdated, owner } = category;
  const type = punchoutUrl ? "punchout" : "internal";
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-slate-800">{name}</span>
        <span className="text-xs text-slate-500">
          {lastUpdated ? formatDate(lastUpdated) : "Not updated"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
        <CategoryBadge type={type} />
        {owner && <span>Owner: {owner}</span>}
      </div>
    </div>
  );
}

function PunchoutRow({ category }) {
  return (
    <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-blue-800">{category.name}</span>
        <span className="text-xs text-blue-600">
          {category.lastUpdated ? formatDate(category.lastUpdated) : "Not updated"}
        </span>
      </div>
      <div className="text-xs text-blue-700 break-words">
        {category.punchoutUrl || "Configured via integrations"}
      </div>
    </div>
  );
}

function CategoryBadge({ type }) {
  if (type === "punchout") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
        PunchOut
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      Internal catalogue
    </span>
  );
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
}

function getTimestamp(value) {
  if (!value) return 0;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}
