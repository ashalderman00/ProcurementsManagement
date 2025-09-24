import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  GitBranch,
  Globe2,
  Heart,
  LineChart,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../components/Card";
import { apiGet } from "../lib/api";

export default function Catalog() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [comparisonIds, setComparisonIds] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const response = await apiGet("/api/catalogue/overview");
        if (!active) return;
        setOverview(response);
      } catch (err) {
        console.warn("Failed to load catalogue overview", err);
        if (active) setOverview(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = overview?.categories ?? [];
  const items = overview?.items ?? [];
  const vendorFeeds = overview?.vendorFeeds ?? [];
  const punchoutConnections = overview?.punchoutConnections ?? [];
  const analytics = overview?.analytics ?? {};

  const summaryData = useMemo(() => {
    if (overview?.summary) return overview.summary;
    const feedsRequiringReview = vendorFeeds.filter(
      (feed) => feed.requiresFinanceReview && feed.pendingChanges > 0
    ).length;
    return {
      activeCategories: categories.length,
      totalItems: items.length,
      feedsRequiringReview,
      punchoutConnections: punchoutConnections.length,
      punchoutHealth: null,
    };
  }, [overview, categories.length, items.length, vendorFeeds.length, punchoutConnections.length]);

  const coverageMap = useMemo(() => {
    const map = new Map();
    for (const category of categories) {
      map.set(category.id, Array.isArray(category.coverage) ? category.coverage : []);
    }
    return map;
  }, [categories]);

  const supplierOptions = useMemo(() => {
    const set = new Set();
    categories.forEach((cat) => (cat.preferredSuppliers || []).forEach((s) => set.add(s)));
    items.forEach((item) => {
      if (item.preferredSupplier) set.add(item.preferredSupplier);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categories, items]);

  const coverageOptions = useMemo(() => {
    const set = new Set();
    categories.forEach((cat) => (cat.coverage || []).forEach((entry) => set.add(entry.level)));
    return ["all", ...Array.from(set)];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return categories.filter((category) => {
      const suppliers = (category.preferredSuppliers || []).map((s) => s.toLowerCase());
      const matchesQuery =
        !query ||
        category.name.toLowerCase().includes(query) ||
        (category.parentName && category.parentName.toLowerCase().includes(query)) ||
        suppliers.some((supplier) => supplier.includes(query));
      if (!matchesQuery) return false;
      if (
        supplierFilter !== "all" &&
        !suppliers.includes(String(supplierFilter).toLowerCase())
      )
        return false;
      if (coverageFilter !== "all") {
        const coverage = coverageMap.get(category.id) || [];
        if (!coverage.some((entry) => entry.level === coverageFilter)) return false;
      }
      return true;
    });
  }, [categories, coverageFilter, coverageMap, searchTerm, supplierFilter]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(query)) ||
        (item.sku && item.sku.toLowerCase().includes(query));
      if (!matchesQuery) return false;
      if (supplierFilter !== "all" && item.preferredSupplier !== supplierFilter) return false;
      if (coverageFilter !== "all") {
        const coverage = coverageMap.get(item.categoryId) || [];
        if (!coverage.some((entry) => entry.level === coverageFilter)) return false;
      }
      return true;
    });
  }, [coverageFilter, coverageMap, items, searchTerm, supplierFilter]);

  const comparisonItems = useMemo(
    () => items.filter((item) => comparisonIds.includes(item.id)),
    [comparisonIds, items]
  );

  const favoriteItems = useMemo(
    () => items.filter((item) => favorites.includes(item.id)),
    [favorites, items]
  );

  function toggleComparison(itemId) {
    setComparisonIds((prev) => {
      if (prev.includes(itemId)) return prev.filter((id) => id !== itemId);
      if (prev.length >= 3) return [...prev.slice(1), itemId];
      return [...prev, itemId];
    });
  }

  function toggleFavorite(itemId) {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }

  const metrics = [
    {
      icon: Boxes,
      label: "Active categories",
      value: summaryData?.activeCategories ?? 0,
    },
    {
      icon: FileSpreadsheet,
      label: "Catalogue items",
      value: summaryData?.totalItems ?? 0,
    },
    {
      icon: RefreshCw,
      label: "Feeds awaiting review",
      value: summaryData?.feedsRequiringReview ?? 0,
    },
    {
      icon: ShieldCheck,
      label: "PunchOut health",
      value:
        summaryData?.punchoutHealth !== null && summaryData?.punchoutHealth !== undefined
          ? `${summaryData.punchoutHealth}% success`
          : "Monitoring",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Catalogue control center"
          subtitle="Strengthen data foundations, automate vendor feeds, and unlock modern requester experiences"
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Metric key={metric.label} {...metric} loading={loading} />
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Every category now carries hierarchy context, contract numbers, and preferred suppliers so
            buyers always launch compliant carts. Vendor-managed feeds, punchout storefronts, and
            analytics exports are orchestrated directly from this workspace.
          </p>
        </CardBody>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title="Category hierarchy & coverage"
            subtitle="Track how curated content rolls up across business units"
            actions={
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
                to="/app/requests"
              >
                View demand <ArrowUpRight size={16} />
              </Link>
            }
          />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Search categories or suppliers"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Filter size={14} aria-hidden="true" />
                <select
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                  value={supplierFilter}
                  onChange={(event) => setSupplierFilter(event.target.value)}
                >
                  <option value="all">All suppliers</option>
                  {supplierOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                  value={coverageFilter}
                  onChange={(event) => setCoverageFilter(event.target.value)}
                >
                  {coverageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All coverage" : titleCase(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCategories.length ? (
                filteredCategories.map((category) => (
                  <CategoryInsightRow key={category.id} category={category} loading={loading} />
                ))
              ) : (
                <EmptyState
                  icon={GitBranch}
                  message={
                    loading
                      ? "Loading category hierarchy…"
                      : "No categories match the current filters. Adjust search or onboard a new catalogue domain."
                  }
                />
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Vendor-managed feeds"
            subtitle="Govern imports with review workflows and change tracking"
            actions={
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
                to="/app/integrations#automation"
              >
                Configure automation <ArrowUpRight size={16} />
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {vendorFeeds.length ? (
              vendorFeeds.map((feed) => <FeedRow key={feed.id} feed={feed} />)
            ) : (
              <EmptyState
                icon={Workflow}
                message={
                  loading
                    ? "Checking vendor feed pipelines…"
                    : "Connect a vendor-managed feed to automate pricing refreshes and finance sign-off."
                }
              />
            )}
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
              Draft → review → publish workflows keep finance and sourcing in the loop. Change logs and
              effective dates post back to ERP and analytics exports automatically.
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader
            title="Requester workspace"
            subtitle="Search, filter, and compare catalogue items before raising demand"
            actions={
              <Link
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
                to="/app/intake-checklist"
              >
                Intake checklist <ArrowUpRight size={16} />
              </Link>
            }
          />
          <CardBody className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" aria-hidden="true" />
              <p>
                Requesters get full-text search, attribute filters, side-by-side comparisons, and favourites so
                the right catalogue item is one click away.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} match</span>
                  <span>
                    Showing up to 6 curated results. Route to punchout when pricing is dynamic.
                  </span>
                </div>
                <div className="space-y-3">
                  {loading && !items.length ? (
                    <EmptyState icon={Search} message="Loading catalogue items…" />
                  ) : filteredItems.length ? (
                    filteredItems.slice(0, 6).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onToggleFavorite={toggleFavorite}
                        onToggleCompare={toggleComparison}
                        isFavorite={favorites.includes(item.id)}
                        isCompared={comparisonIds.includes(item.id)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Search}
                      message="No items match the current filters. Import new content or adjust search criteria."
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <ComparisonPanel
                  items={comparisonItems}
                  onRemove={toggleComparison}
                />
                <FavoritesPanel items={favoriteItems} onRemove={toggleFavorite} />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="PunchOut governance"
              subtitle="Monitor SSO health, cart returns, and coverage recommendations"
              actions={
                <Link
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
                  to="/app/integrations#punchout"
                >
                  Manage connectors <ArrowUpRight size={16} />
                </Link>
              }
            />
            <CardBody className="space-y-3">
              {punchoutConnections.length ? (
                punchoutConnections.map((connection) => (
                  <PunchoutRow key={connection.id} connection={connection} />
                ))
              ) : (
                <EmptyState
                  icon={Globe2}
                  message={
                    loading
                      ? "Checking punchout storefronts…"
                      : "Activate supplier punchout storefronts to extend catalogue coverage without bypassing approvals."
                  }
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Analytics & integrations"
              subtitle="Expose coverage insights and refresh cadences to downstream systems"
            />
            <CardBody className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Business unit coverage</h4>
                <div className="mt-2 space-y-3">
                  {(analytics.businessUnitCoverage || []).map((entry) => (
                    <div key={entry.businessUnit} className="space-y-1 rounded-2xl border border-slate-100 p-3">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{entry.businessUnit}</span>
                        <span className="font-medium text-slate-700">{entry.fullPercent}% full</span>
                      </div>
                      <ProgressBar value={entry.fullPercent} />
                      <div className="text-xs text-slate-500">
                        Full: {entry.full} · Partial: {entry.partial} · None: {entry.none}
                      </div>
                    </div>
                  ))}
                  {!(analytics.businessUnitCoverage || []).length && (
                    <EmptyState
                      icon={LineChart}
                      message="Coverage analytics appear here once business units are mapped to categories."
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InsightStat
                  icon={LineChart}
                  label="Coverage score avg"
                  value={
                    analytics.coverageScoreAverage !== null && analytics.coverageScoreAverage !== undefined
                      ? `${analytics.coverageScoreAverage}%`
                      : "No data"
                  }
                  helper={`${analytics.unitsWithGaps ?? 0} business unit${(analytics.unitsWithGaps ?? 0) === 1 ? "" : "s"} need uplift`}
                />
                <InsightStat
                  icon={RefreshCw}
                  label="Feed refresh cadence"
                  value={
                    analytics.reviewCadenceDays !== null && analytics.reviewCadenceDays !== undefined
                      ? `${analytics.reviewCadenceDays} days`
                      : "—"
                  }
                  helper={`${summaryData?.feedsRequiringReview ?? 0} feed${(summaryData?.feedsRequiringReview ?? 0) === 1 ? "" : "s"} awaiting finance review`}
                />
                <InsightStat
                  icon={AlertCircle}
                  label="Variance alerts"
                  value={analytics.priceVarianceAlerts ?? 0}
                  helper="Price checks flagged for review"
                />
                <InsightStat
                  icon={ShieldCheck}
                  label="Connectors healthy"
                  value={`${(punchoutConnections.length || 0) - (analytics.connectorsNeedingAttention || 0)} / ${punchoutConnections.length || 0}`}
                  helper={`${analytics.connectorsNeedingAttention || 0} require follow-up`}
                />
              </div>

              <p className="text-xs text-slate-500">
                Export catalogue coverage, refresh cadences, and punchout telemetry to ERP, FP&A, or BI tools via
                scheduled API jobs. Keep downstream systems synchronized as content is reviewed and published.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, isText, loading }) {
  const display = loading && !isText ? "—" : value;
  const formatted =
    typeof display === "number" && !isText
      ? display.toLocaleString()
      : display;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {Icon ? <Icon size={14} strokeWidth={1.75} aria-hidden="true" /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {formatted}
      </div>
    </div>
  );
}

function CategoryInsightRow({ category, loading }) {
  const suppliers = category.preferredSuppliers || [];
  const coverage = category.coverage || [];
  const coverageSummary = coverage.length
    ? coverage.map((entry) => `${entry.businessUnit}: ${titleCase(entry.level)}`).join(" · ")
    : "No business unit assignments";
  const lastUpdated = category.lastUpdatedAt ? formatDate(category.lastUpdatedAt) : "—";
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <GitBranch size={16} className="text-slate-400" aria-hidden="true" />
            <span>{category.name}</span>
          </div>
          <div className="text-xs text-slate-500">
            {category.parentName ? `${category.parentName} • ` : ""}Contract {category.contractNumber}
          </div>
          <div className="text-xs text-slate-500">
            {suppliers.length ? `Preferred suppliers: ${suppliers.join(", ")}` : "Preferred supplier required"}
          </div>
        </div>
        <div className="text-xs text-slate-500">{loading ? "—" : `Updated ${lastUpdated}`}</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-xs text-slate-500">Catalogue items</div>
          <div className="text-sm font-semibold text-slate-800">
            {category.itemCount.toLocaleString()} ({category.activeItemCount} active)
          </div>
          <div className="text-xs text-slate-500">
            Units: {category.unitsOfMeasure?.length ? category.unitsOfMeasure.join(", ") : "—"}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-xs text-slate-500">Coverage score</div>
          <div className="flex items-center gap-2">
            <ProgressBar value={category.coverageScore} />
            <span className="text-sm font-semibold text-slate-800">{category.coverageScore}%</span>
          </div>
          <div className="text-xs text-slate-500">{coverageSummary}</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 space-y-1">
          <div className="text-xs text-slate-500">Content operations</div>
          <div className="text-xs text-slate-600">
            {category.pendingChanges} change{category.pendingChanges === 1 ? "" : "s"} in pipeline
          </div>
          <div className="text-xs text-slate-600">
            {category.requiresFinanceReview ? (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <AlertCircle size={14} aria-hidden="true" /> Finance review required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={14} aria-hidden="true" /> Ready to publish
              </span>
            )}
          </div>
          {category.punchoutStatus ? (
            <div className="text-xs text-slate-600">
              {category.punchoutStatus.healthy} / {category.punchoutStatus.total} punchout connector
              {category.punchoutStatus.total === 1 ? "" : "s"} healthy
            </div>
          ) : (
            <div className="text-xs text-slate-600">No punchout connectors mapped</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedRow({ feed }) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{feed.feedName}</div>
          <div className="text-xs text-slate-500">
            {feed.supplier} • {feed.format} • {feed.categoryName || "Unmapped"}
          </div>
        </div>
        <StatusBadge status={feed.status} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span>{feed.pendingChanges} pending change{feed.pendingChanges === 1 ? "" : "s"}</span>
        <span>Last import: {feed.lastImportedAt ? formatDate(feed.lastImportedAt) : "—"}</span>
        <span>Next refresh: {feed.nextRefreshDue ? formatDate(feed.nextRefreshDue) : "—"}</span>
      </div>
      {feed.requiresFinanceReview ? (
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Finance review required before publish. {feed.changeLogUrl ? <a className="underline" href={feed.changeLogUrl}>View change log</a> : null}
        </div>
      ) : null}
    </div>
  );
}

function PunchoutRow({ connection }) {
  const success = connection.cartSuccessRate;
  return (
    <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-blue-800">{connection.supplier}</div>
          <div className="text-xs text-blue-700">
            {connection.categoryName || "Unmapped category"} • {connection.coverageScope}
          </div>
        </div>
        <StatusBadge status={connection.status} tone="blue" />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-blue-700">
        <span>SSO: {titleCase(connection.ssoStatus)}</span>
        <span>
          Cart success: {success === null || success === undefined ? "—" : `${success}%`}
        </span>
        <span>
          Last transaction: {connection.lastTransactionAt ? formatDate(connection.lastTransactionAt) : "—"}
        </span>
      </div>
      {connection.notes && (
        <div className="text-xs text-blue-700">{connection.notes}</div>
      )}
    </div>
  );
}

function ComparisonPanel({ items, onRemove }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800">Comparison tray</div>
      {items.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-slate-600">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-2 py-1">Item</th>
                <th className="px-2 py-1">Unit</th>
                <th className="px-2 py-1">Supplier</th>
                <th className="px-2 py-1">Base price</th>
                <th className="px-2 py-1">Pricing tiers</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tiers = item.pricingTiers ? Object.keys(item.pricingTiers).join(" / ") : "—";
                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-2 py-1 font-medium text-slate-700">{item.name}</td>
                    <td className="px-2 py-1">{item.unitOfMeasure}</td>
                    <td className="px-2 py-1">{item.preferredSupplier}</td>
                    <td className="px-2 py-1">{formatCurrency(item.basePrice, item.currency)}</td>
                    <td className="px-2 py-1">{tiers}</td>
                    <td className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-xs font-medium text-blue-700 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Select up to three items to benchmark pricing tiers, suppliers, and coverage notes.
        </p>
      )}
    </div>
  );
}

function FavoritesPanel({ items, onRemove }) {
  return (
    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <Heart size={16} aria-hidden="true" />
        Favourites
      </div>
      {items.length ? (
        <ul className="space-y-2 text-xs text-amber-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className="font-medium">{item.name}</span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="text-xs font-medium text-amber-700 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-amber-700">
          Mark go-to catalogue items so requesters can raise requisitions in seconds.
        </p>
      )}
    </div>
  );
}

function ItemRow({ item, onToggleFavorite, onToggleCompare, isFavorite, isCompared }) {
  const tiers = item.pricingTiers ? Object.keys(item.pricingTiers).length : 0;
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
          <div className="text-xs text-slate-500">
            {item.categoryName} • {item.unitOfMeasure} • {item.contractNumber}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(item.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isFavorite
                ? "border-amber-500 bg-amber-100 text-amber-800"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {isFavorite ? "Favourited" : "Favourite"}
          </button>
          <button
            type="button"
            onClick={() => onToggleCompare(item.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isCompared
                ? "border-blue-500 bg-blue-100 text-blue-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {isCompared ? "In tray" : "Compare"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span>{formatCurrency(item.basePrice, item.currency)}</span>
        <span>Supplier: {item.preferredSupplier}</span>
        <span>Status: {titleCase(item.status)}</span>
        <span>{tiers} pricing tier{tiers === 1 ? "" : "s"}</span>
        {item.lastReviewedAt && <span>Last reviewed {formatDate(item.lastReviewedAt)}</span>}
      </div>
      {item.coverageNotes && (
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {item.coverageNotes}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, tone = "slate" }) {
  if (!status) return null;
  const palette = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${palette}`}>
      {titleCase(status)}
    </span>
  );
}

function InsightStat({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        {Icon ? <Icon size={14} aria-hidden="true" /> : null}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
      {helper && <div className="text-xs text-slate-500">{helper}</div>}
    </div>
  );
}

function ProgressBar({ value }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full bg-blue-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
      {Icon ? <Icon size={16} aria-hidden="true" className="text-slate-400" /> : null}
      <span>{message}</span>
    </div>
  );
}

function titleCase(value) {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function formatCurrency(amount, currency = "USD") {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}
