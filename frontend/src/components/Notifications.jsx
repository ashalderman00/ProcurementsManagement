import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckSquare,
  FileSpreadsheet,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { apiGet } from "../lib/api";
import { useAuth } from "../lib/auth";

const OPEN_ORDER_STATUSES = new Set([
  "draft",
  "pending",
  "awaiting-approval",
  "issued",
  "sent",
  "open",
]);

const RECEIVING_ORDER_STATUSES = new Set([
  "receiving",
  "partially-received",
  "partial",
]);

const CLOSED_ORDER_STATUSES = new Set([
  "received",
  "closed",
  "complete",
  "completed",
  "fulfilled",
]);

const CANCELLED_ORDER_STATUSES = new Set(["cancelled", "void", "rejected"]);

const ORDER_STATUS_FIELDS = ["status", "state", "stage"];
const ORDER_EXPECTED_FIELDS = [
  "expected_date",
  "expectedDate",
  "due_date",
  "dueDate",
  "delivery_date",
  "deliveryDate",
];

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function pickField(record, fields) {
  for (const field of fields) {
    const value = record?.[field];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function getOrderStatus(order) {
  return pickField(order, ORDER_STATUS_FIELDS);
}

function getOrderExpectedDate(order) {
  const raw = pickField(order, ORDER_EXPECTED_FIELDS);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelative(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) {
    return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  if (diff < 2 * day) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString();
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function clampCount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  if (num > 99) return 99;
  return Math.floor(num);
}

export default function Notifications() {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const mountedRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [data, setData] = useState({ requests: [], orders: [] });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!user || !mountedRef.current) {
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        apiGet("/api/requests"),
        apiGet("/api/orders"),
      ]);
      if (!mountedRef.current) return;
      const [requestsRes, ordersRes] = results;
      const next = { requests: [], orders: [] };
      const failed = [];
      if (requestsRes.status === "fulfilled" && Array.isArray(requestsRes.value)) {
        next.requests = requestsRes.value;
      } else {
        failed.push("requests");
      }
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        next.orders = ordersRes.value;
      } else {
        failed.push("purchase orders");
      }
      setData(next);
      setError(
        failed.length
          ? `Unable to load ${failed.join(" & ")}.`
          : ""
      );
      setLastUpdated(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;
      console.warn("notifications.load.error", err);
      setError("Unable to load notifications.");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      if (!mountedRef.current) return;
      setData({ requests: [], orders: [] });
      setLastUpdated(null);
      setError("");
      setOpen(false);
    }
  }, [user, loadData]);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointer(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const summary = useMemo(() => {
    const requests = Array.isArray(data.requests) ? data.requests : [];
    const orders = Array.isArray(data.orders) ? data.orders : [];

    let pendingRequests = 0;
    let approvedRequests = 0;
    let deniedRequests = 0;
    let newestRequest = null;

    requests.forEach((req) => {
      const status = normalizeStatus(req?.status);
      if (status === "pending") pendingRequests += 1;
      else if (status === "approved") approvedRequests += 1;
      else if (status === "denied") deniedRequests += 1;
      const created = req?.updated_at || req?.created_at;
      if (created) {
        const date = new Date(created);
        if (!Number.isNaN(date.getTime())) {
          if (!newestRequest || date > newestRequest) {
            newestRequest = date;
          }
        }
      }
    });

    const orderStats = {
      total: orders.length,
      open: 0,
      receiving: 0,
      closed: 0,
      cancelled: 0,
      dueSoon: 0,
      late: 0,
    };

    const now = new Date();
    const soon = new Date(now);
    soon.setDate(now.getDate() + 7);

    orders.forEach((order) => {
      const status = normalizeStatus(getOrderStatus(order));
      if (RECEIVING_ORDER_STATUSES.has(status)) {
        orderStats.receiving += 1;
        orderStats.open += 1;
      } else if (CLOSED_ORDER_STATUSES.has(status)) {
        orderStats.closed += 1;
      } else if (CANCELLED_ORDER_STATUSES.has(status)) {
        orderStats.cancelled += 1;
      } else if (OPEN_ORDER_STATUSES.has(status) || !status) {
        orderStats.open += 1;
      }

      const expected = getOrderExpectedDate(order);
      if (expected) {
        if (
          expected < now &&
          !CLOSED_ORDER_STATUSES.has(status) &&
          !CANCELLED_ORDER_STATUSES.has(status)
        ) {
          orderStats.late += 1;
        } else if (expected >= now && expected <= soon) {
          orderStats.dueSoon += 1;
        }
      }
    });

    return {
      requests: {
        total: requests.length,
        pending: pendingRequests,
        approved: approvedRequests,
        denied: deniedRequests,
        newest: newestRequest,
      },
      orders: orderStats,
    };
  }, [data]);

  const badgeCount = useMemo(() => {
    if (!user) return 0;
    return clampCount(summary.requests.pending + summary.orders.open);
  }, [summary, user]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return "";
    return formatTime(lastUpdated);
  }, [lastUpdated]);

  const notifications = useMemo(() => {
    const items = [];
    const requests = summary.requests;
    const orders = summary.orders;

    items.push({
      id: "requests",
      label: "Requests",
      icon: ShoppingCart,
      to: "/app/requests",
      description: requests.total
        ? `${requests.pending.toLocaleString()} pending • ${requests.approved.toLocaleString()} approved`
        : "No requests submitted yet.",
      meta: [
        requests.denied ? `${requests.denied.toLocaleString()} denied` : null,
        requests.newest ? `Updated ${formatRelative(requests.newest)}` : null,
      ].filter(Boolean),
      primary: requests.total,
      primaryLabel: requests.total === 1 ? "Request" : "Requests",
    });

    items.push({
      id: "approvals",
      label: "Approvals",
      icon: CheckSquare,
      to: "/app/approvals",
      description: requests.pending
        ? "Decide on pending requisitions to keep purchasing moving."
        : "All approvals are up to date.",
      meta: requests.pending
        ? [
            requests.pending === 1
              ? "1 request awaiting a decision"
              : `${requests.pending.toLocaleString()} requests awaiting decisions`,
          ]
        : [],
      primary: requests.pending,
      primaryLabel:
        requests.pending === 0
          ? "Clear"
          : requests.pending === 1
          ? "Needs review"
          : "Need review",
    });

    items.push({
      id: "orders",
      label: "Purchase orders",
      icon: FileSpreadsheet,
      to: "/app/purchase-orders",
      description: orders.open
        ? `${orders.receiving.toLocaleString()} receiving • ${orders.dueSoon.toLocaleString()} due soon`
        : "No active purchase orders today.",
      meta: [
        orders.closed ? `${orders.closed.toLocaleString()} closed` : null,
        orders.cancelled ? `${orders.cancelled.toLocaleString()} cancelled` : null,
        orders.late ? `${orders.late.toLocaleString()} late` : null,
      ].filter(Boolean),
      primary: orders.open,
      primaryLabel:
        orders.open === 0
          ? "Clear"
          : orders.open === 1
          ? "Open order"
          : "Open orders",
    });

    return items;
  }, [summary]);

  return (
    <div className="workspace-notifications" ref={containerRef}>
      <button
        type="button"
        className={`workspace-notifications-button${open ? " open" : ""}${
          badgeCount ? " has-updates" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="workspace-notifications-panel"
        aria-haspopup="dialog"
        title={badgeCount ? `${badgeCount} new items` : "View inbox"}
      >
        <Bell size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="workspace-notifications-label">Inbox</span>
        {loading ? (
          <Loader2
            size={14}
            strokeWidth={2}
            className="workspace-notifications-spinner"
            aria-hidden="true"
          />
        ) : null}
        {badgeCount ? (
          <span className="workspace-notifications-count" aria-hidden="true">
            {badgeCount}
          </span>
        ) : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.section
            key="notifications-panel"
            id="workspace-notifications-panel"
            role="dialog"
            aria-label="Workspace inbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: "easeIn" } }}
            className="workspace-notifications-panel"
          >
            <header className="workspace-notifications-header">
              <div>
                <div className="workspace-notifications-title">Workspace inbox</div>
                <div className="workspace-notifications-subtitle">
                  {lastUpdatedLabel
                    ? `Updated ${lastUpdatedLabel}`
                    : "Stay on top of requests and orders."}
                </div>
              </div>
              <button
                type="button"
                className="workspace-notifications-refresh"
                onClick={loadData}
                disabled={loading || !user}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={14}
                      strokeWidth={2}
                      className="workspace-notifications-refresh-icon"
                      aria-hidden="true"
                    />
                    Refreshing
                  </>
                ) : (
                  "Refresh"
                )}
              </button>
            </header>
            {error ? (
              <div className="workspace-notifications-error">{error}</div>
            ) : null}
            {user ? (
              <ul className="workspace-notifications-list">
                {notifications.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className="workspace-notification-row"
                      onClick={() => setOpen(false)}
                    >
                      <span className="workspace-notification-icon" aria-hidden="true">
                        <item.icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="workspace-notification-body">
                        <span className="workspace-notification-label">{item.label}</span>
                        {item.description ? (
                          <span className="workspace-notification-description">
                            {item.description}
                          </span>
                        ) : null}
                        {item.meta?.length ? (
                          <span className="workspace-notification-meta">
                            {item.meta.map((meta, idx) => (
                              <span key={`${item.id}-meta-${idx}`}>{meta}</span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                      <span className="workspace-notification-value">
                        <span className="workspace-notification-number">
                          {Number.isFinite(item.primary)
                            ? item.primary.toLocaleString()
                            : "0"}
                        </span>
                        <span className="workspace-notification-value-label">
                          {item.primaryLabel}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="workspace-notifications-empty">
                <p>Sign in to see requests, approvals, and purchase order updates.</p>
                <Link
                  to="/login"
                  className="workspace-notifications-signin"
                  onClick={() => setOpen(false)}
                >
                  Go to sign in
                </Link>
              </div>
            )}
            <footer className="workspace-notifications-footer">
              Numbers update whenever you create requests or manage purchase orders.
            </footer>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
