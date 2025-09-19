import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/Card";
import { T, Th, Td } from "../components/Table";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SkeletonRow from "../components/SkeletonRow";
import Drawer from "../components/Drawer";
import { useToast } from "../components/toast";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

const ORDER_STATUSES = ["draft", "issued", "receiving", "received", "cancelled"];
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
    if (!term) return list;
    return list.filter((order) => {
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
  }, [orders, search]);

  const emptyMessage = orders.length
    ? "No purchase orders match your search."
    : "No purchase orders yet.";

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
                    const rawStatus = pickField(order, ["status", "state", "stage"]);
                    const status = rawStatus
                      ? rawStatus.toString().toLowerCase()
                      : "";
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
                    const dueRaw = pickField(order, [
                      "expected_date",
                      "expectedDate",
                      "due_at",
                      "dueAt",
                      "due_date",
                      "dueDate",
                      "delivery_date",
                      "deliveryDate",
                    ]);
                    const due = formatDate(dueRaw);

                    return (
                      <tr
                        key={key}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
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
                          {dueRaw && (
                            <div className="text-xs text-slate-500">Due {due}</div>
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

function pickField(order, fields) {
  for (const key of fields) {
    const value = order?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
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
