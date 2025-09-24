import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { apiGet, apiPost, apiUpload } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/Card";
import { T, Th, Td } from "../components/Table";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import FAB from "../components/FAB";
import Chip from "../components/Chip";
import { useToast } from "../components/toast";

export default function Requests() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  // drawer state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [data, c] = await Promise.all([apiGet("/api/requests"), apiGet("/api/categories")]);
      setItems(data);
      setCats(c);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const requestMetrics = useMemo(() => {
    const statusCounts = { approved: 0, pending: 0, denied: 0 };
    let totalAmount = 0;
    let lastCreatedAt = null;

    for (const item of items) {
      const amt = Number(item.amount);
      if (!Number.isNaN(amt)) totalAmount += amt;

      const key = (item.status || "").toLowerCase();
      if (key in statusCounts) statusCounts[key] += 1;

      if (item.created_at) {
        const ts = new Date(item.created_at).getTime();
        if (!Number.isNaN(ts)) {
          if (lastCreatedAt === null || ts > lastCreatedAt) lastCreatedAt = ts;
        }
      }
    }

    const total = items.length;
    const averageAmount = total ? totalAmount / total : 0;
    const approvalRate = total ? Math.round((statusCounts.approved / total) * 100) : 0;

    return {
      total,
      statusCounts,
      totalAmount,
      averageAmount,
      approvalRate,
      lastCreatedAt,
    };
  }, [items]);

  const chips = useMemo(() => ([
    { key: "all", label: "All", count: requestMetrics.total },
    { key: "approved", label: "Approved", count: requestMetrics.statusCounts.approved },
    { key: "pending", label: "Pending", count: requestMetrics.statusCounts.pending },
    { key: "denied", label: "Denied", count: requestMetrics.statusCounts.denied },
  ]), [requestMetrics]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }), []);

  const formatAmount = (value) => {
    const amount = Number(value);
    return Number.isNaN(amount) ? "—" : currencyFormatter.format(amount);
  };

  const lastSubmittedLabel = useMemo(() => {
    if (!requestMetrics.lastCreatedAt) return null;
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
      new Date(requestMetrics.lastCreatedAt),
    );
  }, [requestMetrics.lastCreatedAt]);

  const summaryCards = useMemo(() => ([
    {
      title: "Total requests",
      value: requestMetrics.total.toLocaleString(),
      helper: requestMetrics.total
        ? `Avg request ${currencyFormatter.format(requestMetrics.averageAmount)}`
        : "Create your first request to get started",
    },
    {
      title: "Pending approvals",
      value: requestMetrics.statusCounts.pending.toLocaleString(),
      helper: requestMetrics.statusCounts.pending
        ? "Follow up with approvers to keep momentum"
        : "All pending items are cleared",
    },
    {
      title: "Approved",
      value: requestMetrics.statusCounts.approved.toLocaleString(),
      helper: requestMetrics.total
        ? `${requestMetrics.approvalRate}% approval rate`
        : "Approval rate will appear once requests arrive",
    },
    {
      title: "Requested spend",
      value: currencyFormatter.format(requestMetrics.totalAmount),
      helper: lastSubmittedLabel
        ? `Latest submission on ${lastSubmittedLabel}`
        : "Attach quotes to strengthen business cases",
    },
  ]), [currencyFormatter, lastSubmittedLabel, requestMetrics]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(i => {
      const okStatus = status==="all" ? true : i.status===status;
      const okText = !term ? true :
        i.title.toLowerCase().includes(term) ||
        String(i.amount).includes(term) ||
        (i.category_name||"").toLowerCase().includes(term);
      return okStatus && okText;
    });
  }, [items, q, status]);

  async function create(e) {
    e?.preventDefault();
    try {
      const created = await apiPost("/api/requests", {
        title, amount: Number(amount), category_id: categoryId ? Number(categoryId) : null
      });
      if (file) await apiUpload("/api/requests/"+created.id+"/files", file);
      const category = cats.find(c => Number(c.id) === Number(categoryId));
      const normalized = {
        ...created,
        status: (created.status || "pending"),
        category_name: created.category_name || category?.name || null,
      };
      setItems(prev => [normalized, ...prev]);
      setTitle(""); setAmount(""); setCategoryId(""); setFile(null); setOpen(false);
      toast.success("Request created");
    } catch { toast.error("Create failed"); }
  }

  function clearFilters() {
    setStatus("all");
    setQ("");
  }

  async function setStage(id, next) {
    try {
      if (next !== "approved" && next !== "denied") throw new Error("Unsupported status");
      const action = next === "approved" ? "approve" : "deny";
      await apiPost(`/api/requests/${id}/${action}`, {});
      setItems(await apiGet("/api/requests"));
      toast.success(next === "approved" ? "Approval recorded" : "Denial recorded");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  }

  return (
    <div className="space-y-4">
      {/* sticky subheader */}
      <div className="sticky top-3 z-10 glass border border-slate-200 rounded-2xl p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {chips.map(chip => (
              <Chip
                key={chip.key}
                active={status===chip.key}
                onClick={()=>setStatus(chip.key)}
              >
                <span className="flex items-center gap-2">
                  {chip.label}
                  <span className={status===chip.key ? "text-blue-100/90" : "text-slate-400"}>
                    {chip.count.toLocaleString()}
                  </span>
                </span>
              </Chip>
            ))}
          </div>
          <div className="flex flex-col gap-2 md:ml-auto md:flex-row md:items-center">
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm md:w-64"
              placeholder="Search title, amount, category…"
              value={q}
              onChange={e=>setQ(e.target.value)}
            />
            {(q || status!=="all") && (
              <Button variant="ghost" className="whitespace-nowrap" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
            <Button className="whitespace-nowrap" onClick={()=>setOpen(true)}>New request</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => (
          <div key={card.title} className="glass rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.title}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</div>
            {card.helper && <div className="mt-2 text-xs text-slate-500">{card.helper}</div>}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Requests"
          subtitle={loading
            ? "Loading requests…"
            : items.length
              ? `${filtered.length.toLocaleString()} of ${items.length.toLocaleString()} requests shown`
              : "No requests yet — start by creating one"}
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto rounded-2xl">
            <T>
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <Th align="left">Title</Th>
                  <Th align="right">Amount</Th>
                  <Th align="center">Category</Th>
                  <Th align="center">Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({length:6}).map((_,i)=>(
                  <tr key={i} className="border-b border-slate-100">
                    <Td className="text-slate-300">████████</Td>
                    <Td align="right" className="text-slate-300">███</Td>
                    <Td align="center" className="text-slate-300">████</Td>
                    <Td align="center" className="text-slate-300">███</Td>
                    <Td className="text-slate-300">████</Td>
                  </tr>
                ))}
                {!loading && filtered.map(i => (
                  <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <Td><Link className="text-blue-700 underline" to={`/app/requests/${i.id}`}>{i.title}</Link></Td>
                    <Td align="right">{formatAmount(i.amount)}</Td>
                    <Td align="center">{i.category_name || "—"}</Td>
                    <Td align="center"><Badge status={i.status} /></Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={()=>setStage(i.id,'approved')}>Approve</Button>
                        <Button variant="ghost" onClick={()=>setStage(i.id,'denied')}>Deny</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
                {!loading && !filtered.length && (
                  <tr>
                    <Td colSpan="5" align="center" className="py-8 text-slate-500">
                      <div className="space-y-2">
                        <div>No matching requests found.</div>
                        {(q || status!=="all") && (
                          <Button variant="ghost" onClick={clearFilters}>Reset filters</Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                )}
              </tbody>
            </T>
          </div>
        </CardBody>
      </Card>

      {/* mobile friendly FAB */}
      <FAB onClick={()=>setOpen(true)}>+</FAB>

      {/* slide-over intake */}
      <Drawer open={open} title="New purchase request" onClose={()=>setOpen(false)}
        footer={<Button onClick={create}>Create request</Button>}>
        <form onSubmit={create} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Title</label>
            <input className="w-full rounded-lg border px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="MacBook Pro 14&quot;" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Amount</label>
              <input className="w-full rounded-lg border px-3 py-2" value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="1299.99" required />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Category</label>
              <select className="w-full rounded-lg border px-3 py-2" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
                <option value="">(no category)</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Attach quote/receipt (optional)</label>
            <input className="w-full rounded-lg border px-3 py-2" type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          </div>
        </form>
      </Drawer>
      <Outlet />
    </div>
  );
}
