import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/Card";
import { T, Th, Td } from "../components/Table";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SkeletonRow from "../components/SkeletonRow";
import { apiGet } from "../lib/api";

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrders([]);
      setError(e?.message || "Unable to fetch purchase orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Purchase orders"
          subtitle="Monitor issued POs and vendor fulfilment"
          actions={(
            <div className="flex items-center gap-2">
              <input
                className="w-56 rounded-lg border px-3 py-2 text-sm"
                placeholder="Search PO, vendor, status…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="ghost" onClick={load} disabled={loading}>
                Refresh
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
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={5} />
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
                            <div className="text-xs text-slate-500">
                              Due {due}
                            </div>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                {!loading && !filtered.length && (
                  <tr>
                    <Td colSpan="5" className="py-6 text-center text-slate-500">
                      {emptyMessage}
                    </Td>
                  </tr>
                )}
              </tbody>
            </T>
          </div>
        </CardBody>
      </Card>
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
