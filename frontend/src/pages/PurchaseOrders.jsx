import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/Card";
import { T, Th, Td } from "../components/Table";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Chip from "../components/Chip";
import SkeletonRow from "../components/SkeletonRow";
import Drawer from "../components/Drawer";
import { useToast } from "../components/toast";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

const ORDER_STATUSES = ["draft", "issued", "receiving", "received", "cancelled"];
const STATUS_FILTERS = ["all", ...ORDER_STATUSES];
const ACTIVE_STATUSES = new Set(["draft", "issued", "receiving"]);
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const INITIAL_FORM = {
  poNumber: "",
  vendorId: "",
  vendorName: "",
  total: "",
  status: "draft",
  requestId: "",
  expectedDate: "",
  notes: "",
};

export default function PurchaseOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, vendorsRes, requestsRes] = await Promise.all([
        apiGet("/api/orders"),
        apiGet("/api/vendors").catch(() => []),
        apiGet("/api/requests").catch(() => []),
      ]);
      setOrders(Array.isArray(ordersRes) ? ordersRes : []);
      if (Array.isArray(vendorsRes)) setVendors(vendorsRes);
      if (Array.isArray(requestsRes)) setRequests(requestsRes);
    } catch (e) {
      console.error(e);
      setOrders([]);
      setError(e?.message || "Unable to fetch purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const vendorOptions = useMemo(() => {
    return [...vendors].sort((a, b) => a.name.localeCompare(b.name));
  }, [vendors]);

  const requestOptions = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aDate = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });
  }, [requests]);

  const filtered = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const term = search.trim().toLowerCase();
    return list.filter((order) => {
      const status = getStatus(order);
      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }
      if (onlyOverdue && !isOrderOverdue(order)) {
        return false;
      }

      if (!term) return true;

      const values = [
        pickField(order, ["po_number", "poNumber", "number", "id"]),
        pickField(order, ["vendor_name", "vendor", "vendorName"]),
        pickField(order, ["status", "state", "stage"]),
        pickField(order, ["total", "amount", "value"]),
        pickField(order, ["request_id", "requestId"]),
        JSON.stringify(order || {}),
      ];
      return values.some((value) =>
        value && value.toString().toLowerCase().includes(term)
      );
    });
  }, [orders, search, statusFilter, onlyOverdue]);

  const summary = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    let totalValue = 0;
    let openCount = 0;
    let pendingValue = 0;
    let overdueCount = 0;

    list.forEach((order) => {
      const status = getStatus(order);
      if (ACTIVE_STATUSES.has(status)) {
        openCount += 1;
      }
      const amount = parseAmount(
        pickField(order, ["total", "amount", "value"])
      );
      if (amount !== null) {
        totalValue += amount;
        if (status === "issued" || status === "receiving") {
          pendingValue += amount;
        }
      }
      if (isOrderOverdue(order)) {
        overdueCount += 1;
      }
    });

    return {
      totalCount: list.length,
      totalValue,
      openCount,
      pendingValue,
      overdueCount,
    };
  }, [orders]);

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== "all" || onlyOverdue;

  const emptyMessage = summary.totalCount
    ? "No purchase orders match your filters."
    : "No purchase orders yet.";
  const isInitialLoading = loading && !orders.length;

  function openNewDrawer() {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setDrawerOpen(true);
  }

  function openEditDrawer(order) {
    if (!order) return;
    const poNumber =
      pickField(order, ["po_number", "poNumber", "number"]) ?? "";
    const vendorIdRaw = pickField(order, ["vendor_id", "vendorId"]);
    const vendorName =
      pickField(order, ["vendor_name", "vendor", "vendorName"]) || "";
    const totalRaw = pickField(order, ["total", "amount", "value"]);
    const statusRaw = pickField(order, ["status", "state", "stage"]);
    const requestIdRaw = pickField(order, ["request_id", "requestId"]);
    const expectedRaw = pickField(order, [
      "expected_date",
      "expectedDate",
      "due_date",
      "dueDate",
      "delivery_date",
      "deliveryDate",
    ]);
    const notesRaw = pickField(order, ["notes", "memo", "comment"]) || "";

    let expectedDate = "";
    if (expectedRaw) {
      const date = new Date(expectedRaw);
      if (!Number.isNaN(date.getTime())) {
        expectedDate = date.toISOString().slice(0, 10);
      }
    }

    setEditing(order);
    setForm({
      poNumber: poNumber || "",
      vendorId: vendorIdRaw ? String(vendorIdRaw) : "",
      vendorName: vendorName || "",
      total:
        totalRaw !== undefined && totalRaw !== null && totalRaw !== ""
          ? String(totalRaw)
          : "",
      status:
        typeof statusRaw === "string" && ORDER_STATUSES.includes(statusRaw.toLowerCase())
          ? statusRaw.toLowerCase()
          : "draft",
      requestId: requestIdRaw ? String(requestIdRaw) : "",
      expectedDate,
      notes: notesRaw || "",
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setSaving(false);
    setDeleting(false);
  }

  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setOnlyOverdue(false);
    setSearch("");
  }, []);

  function handleVendorSelect(event) {
    const value = event.target.value;
    const vendor = vendorOptions.find((v) => String(v.id) === value);
    setForm((prev) => ({
      ...prev,
      vendorId: value,
      vendorName: vendor ? vendor.name : prev.vendorName,
    }));
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    if (saving) return;

    const amount = Number(form.total);
    if (Number.isNaN(amount) || amount < 0) {
      toast?.error?.("Enter a valid total amount");
      return;
    }

    const vendorName = form.vendorName.trim();
    if (!vendorName && !form.vendorId) {
      toast?.error?.("Vendor name is required");
      return;
    }

    if (!ORDER_STATUSES.includes(form.status)) {
      toast?.error?.("Choose a valid status");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        po_number: form.poNumber.trim() || null,
        total: amount,
        status: form.status,
        vendor_id: form.vendorId ? Number(form.vendorId) : null,
        vendor_name: vendorName || undefined,
        request_id: form.requestId ? Number(form.requestId) : null,
        expected_date: form.expectedDate || null,
        notes: form.notes.trim() ? form.notes.trim() : null,
      };

      if (editing?.id) {
        await apiPatch(`/api/orders/${editing.id}`, payload);
        toast?.success?.("Purchase order updated");
      } else {
        await apiPost("/api/orders", payload);
        toast?.success?.("Purchase order created");
      }

      await load();
      closeDrawer();
    } catch (err) {
      console.error(err);
      toast?.error?.("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing?.id || deleting) return;
    // eslint-disable-next-line no-alert
    const confirmed = typeof window !== "undefined" ? window.confirm("Delete this purchase order?") : true;
    if (!confirmed) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/orders/${editing.id}`);
      toast?.success?.("Purchase order deleted");
      await load();
      closeDrawer();
    } catch (err) {
      console.error(err);
      toast?.error?.("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const editingLabel = editing
    ? pickField(editing, ["po_number", "poNumber", "number", "id"]) || editing.id
    : "";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Total purchase orders"
          value={
            isInitialLoading
              ? "…"
              : summary.totalCount.toLocaleString()
          }
          hint="Across all statuses"
          tone={isInitialLoading ? "text-slate-400" : undefined}
        />
        <SummaryTile
          label="Open orders"
          value={
            isInitialLoading
              ? "…"
              : summary.openCount.toLocaleString()
          }
          hint={
            isInitialLoading
              ? ""
              : `${formatCurrency(summary.pendingValue)} awaiting receipt`
          }
          tone={isInitialLoading ? "text-slate-400" : undefined}
        />
        <SummaryTile
          label="Total PO value"
          value={isInitialLoading ? "…" : formatCurrency(summary.totalValue)}
          hint="Combined value of every purchase order"
          tone={isInitialLoading ? "text-slate-400" : undefined}
        />
        <SummaryTile
          label="Overdue deliveries"
          value={
            isInitialLoading
              ? "…"
              : summary.overdueCount.toLocaleString()
          }
          hint="Past expected delivery date"
          tone={
            isInitialLoading
              ? "text-slate-400"
              : summary.overdueCount
              ? "text-red-600"
              : "text-slate-900"
          }
        />
      </div>
      <Card>
        <CardHeader
          title="Purchase orders"
          subtitle="Monitor issued POs and vendor fulfilment"
          actions={(
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="w-56 rounded-lg border px-3 py-2 text-sm"
                placeholder="Search PO, vendor, status…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="ghost" onClick={load} disabled={loading}>
                Refresh
              </Button>
              <Button onClick={openNewDrawer} disabled={loading}>
                New PO
              </Button>
            </div>
          )}
        />
        <CardBody className="p-0">
          {error && (
            <div className="border-b border-red-200 bg-red-50/90 px-5 py-3 text-sm text-red-600">
              Failed to load purchase orders: {error}
            </div>
          )}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => {
                const label =
                  status === "all"
                    ? "All"
                    : status.charAt(0).toUpperCase() + status.slice(1);
                return (
                  <Chip
                    key={status}
                    active={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={onlyOverdue}
                  onChange={(event) => setOnlyOverdue(event.target.checked)}
                />
                Show overdue deliveries only
              </label>
              {!loading && (
                <span className="text-slate-500">
                  Showing {filtered.length} of {summary.totalCount} purchase orders
                </span>
              )}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl">
            <T>
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <Th align="left">PO #</Th>
                  <Th align="left">Vendor</Th>
                  <Th align="right">Total</Th>
                  <Th align="center">Status</Th>
                  <Th align="left">Updated</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={6} />
                  ))}
                {!loading &&
                  filtered.map((order, idx) => {
                    const key =
                      order?.id ??
                      order?.po_number ??
                      order?.poNumber ??
                      order?.number ??
                      idx;
                    const poNumber =
                      pickField(order, ["po_number", "poNumber", "number", "id"]) || "—";
                    const requestId = pickField(order, ["request_id", "requestId"]);
                    const vendorName =
                      pickField(order, ["vendor_name", "vendor", "vendorName"]) || "—";
                    const vendorId = pickField(order, ["vendor_id", "vendorId"]);
                    const totalRaw = pickField(order, ["total", "amount", "value"]);
                    const total = formatCurrency(totalRaw);
                    const status = getStatus(order);
                    const updatedRaw = pickField(order, [
                      "updated_at",
                      "updatedAt",
                      "created_at",
                      "createdAt",
                      "date",
                      "issued_at",
                      "issuedAt",
                    ]);
                    const updated = formatDate(updatedRaw);
                    const dueDetails = getDueDetails(order);
                    const overdue = isOrderOverdue(order);

                    return (
                      <tr
                        key={key}
                        className={`border-b border-slate-100 transition ${
                          overdue ? "bg-red-50/70 hover:bg-red-100/70" : "hover:bg-slate-50"
                        }`}
                      >
                        <Td>
                          <div className="font-medium">{poNumber}</div>
                          {requestId && (
                            <div className="text-xs text-slate-500">
                              Request #{requestId}
                            </div>
                          )}
                        </Td>
                        <Td>
                          <div className="font-medium">{vendorName}</div>
                          {vendorId && (
                            <div className="text-xs text-slate-500">
                              Vendor #{vendorId}
                            </div>
                          )}
                        </Td>
                        <Td align="right">{total}</Td>
                        <Td align="center">
                          <Badge status={status || undefined} />
                        </Td>
                        <Td>
                          <div>{updated}</div>
                          {dueDetails.message && (
                            <div className={`text-xs ${dueDetails.tone}`}>
                              {dueDetails.message}
                            </div>
                          )}
                        </Td>
                        <Td align="right">
                          <Button
                            variant="ghost"
                            onClick={() => openEditDrawer(order)}
                          >
                            Edit
                          </Button>
                        </Td>
                      </tr>
                    );
                  })}
                {!loading && !filtered.length && (
                  <tr>
                    <Td colSpan="6" className="py-6 text-center text-slate-500">
                      {emptyMessage}
                    </Td>
                  </tr>
                )}
              </tbody>
            </T>
          </div>
        </CardBody>
      </Card>

      <Drawer
        open={drawerOpen}
        title={
          editing
            ? `Edit purchase order ${editingLabel}`
            : "New purchase order"
        }
        onClose={closeDrawer}
        footer={(
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {editing ? (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={closeDrawer}
                disabled={saving || deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving || deleting}
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create PO"}
              </Button>
            </div>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">PO number</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.poNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, poNumber: e.target.value }))}
              placeholder="PO-00510"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Vendor</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.vendorId}
                onChange={handleVendorSelect}
              >
                <option value="">Select vendor…</option>
                {vendorOptions.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Vendor name
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.vendorName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, vendorName: e.target.value }))
                }
                placeholder="Acme Corporation"
                required={!form.vendorId}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Total</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="number"
                min="0"
                step="0.01"
                value={form.total}
                onChange={(e) => setForm((prev) => ({ ...prev, total: e.target.value }))}
                placeholder="1299.99"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Status</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Linked request</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.requestId}
              onChange={(e) => setForm((prev) => ({ ...prev, requestId: e.target.value }))}
            >
              <option value="">(no linked request)</option>
              {requestOptions.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.title || `Request #${request.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">
                Expected delivery
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="date"
                value={form.expectedDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expectedDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-600">Notes</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Share delivery expectations, payment terms…"
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
}

function SummaryTile({ label, value, hint, tone = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-xl font-semibold ${tone}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function pickField(order, fields) {
  for (const key of fields) {
    const value = order?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function getStatus(order) {
  const raw = pickField(order, ["status", "state", "stage"]);
  if (raw === undefined || raw === null) return "";
  return raw.toString().toLowerCase();
}

function parseAmount(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDueDate(order) {
  const raw = pickField(order, [
    "expected_date",
    "expectedDate",
    "due_at",
    "dueAt",
    "due_date",
    "dueDate",
    "delivery_date",
    "deliveryDate",
  ]);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isOrderOverdue(order) {
  const status = getStatus(order);
  if (!status || status === "received" || status === "cancelled") {
    return false;
  }
  const dueDate = getDueDate(order);
  if (!dueDate) return false;
  const endOfDue = new Date(dueDate);
  endOfDue.setHours(23, 59, 59, 999);
  return endOfDue.getTime() < Date.now();
}

function getDueDetails(order) {
  const dueDate = getDueDate(order);
  if (!dueDate) {
    return { message: "", tone: "text-slate-500" };
  }

  const status = getStatus(order);
  const formattedDate = formatDate(dueDate);
  const isFinalized = status === "received" || status === "cancelled";
  const endOfDue = new Date(dueDate);
  endOfDue.setHours(23, 59, 59, 999);
  const diffMs = endOfDue.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / DAY_IN_MS);

  if (!isFinalized && diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    const overdueText =
      overdueDays > 0
        ? `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`
        : "Overdue";
    return {
      message: `${overdueText} • ${formattedDate}`,
      tone: "text-red-600",
    };
  }

  if (!isFinalized && diffDays === 0) {
    return {
      message: `Due today • ${formattedDate}`,
      tone: "text-amber-600",
    };
  }

  if (!isFinalized && diffDays > 0 && diffDays <= 3) {
    return {
      message: `Due in ${diffDays} day${diffDays === 1 ? "" : "s"} • ${formattedDate}`,
      tone: "text-amber-600",
    };
  }

  return {
    message: `Expected ${formattedDate}`,
    tone: "text-slate-500",
  };
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}
