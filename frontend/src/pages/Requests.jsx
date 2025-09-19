import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../lib/auth";

export default function Requests() {
  const toast = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalStages, setApprovalStages] = useState({});
  const [pendingActionId, setPendingActionId] = useState(null);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const chips = ["all","approved","pending","denied"];

  // drawer state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState(null);

  const userRole = user?.role || "";

  const fetchApprovalsFor = useCallback(
    async (requests, { replace = false } = {}) => {
      if (!Array.isArray(requests)) return;
      if (!requests.length) {
        if (replace) setApprovalStages({});
        return;
      }

      setApprovalStages((prev) => {
        if (replace) {
          const next = {};
          for (const req of requests) next[req.id] = undefined;
          return next;
        }
        const next = { ...prev };
        for (const req of requests) {
          if (!(req.id in next)) next[req.id] = undefined;
        }
        return next;
      });

      const results = await Promise.all(
        requests.map(async (req) => {
          try {
            const stages = await apiGet(`/api/requests/${req.id}/approvals`);
            return [req.id, stages];
          } catch (err) {
            console.error(`Failed to load approvals for request ${req.id}`, err);
            return [req.id, null];
          }
        })
      );

      setApprovalStages((prev) => {
        const next = replace ? {} : { ...prev };
        for (const [id, stages] of results) next[id] = stages;
        return next;
      });
    },
    []
  );

  const pendingStageFor = useCallback(
    (requestId) => {
      const entry = approvalStages[requestId];
      if (!Array.isArray(entry)) return null;
      return entry.find((stage) => stage.status === "pending") || null;
    },
    [approvalStages]
  );

  async function load() {
    setLoading(true);
    try {
      const [data, c] = await Promise.all([apiGet("/api/requests"), apiGet("/api/categories")]);
      setItems(data); setCats(c);
      await fetchApprovalsFor(data, { replace: true });
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

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
      setItems(prev => [created, ...prev]);
      await fetchApprovalsFor([created]);
      setTitle(""); setAmount(""); setCategoryId(""); setFile(null); setOpen(false);
      toast.success("Request created");
    } catch { toast.error("Create failed"); }
  }

  async function setStage(id, next) {
    try {
      if (next !== "approved" && next !== "denied") throw new Error("Unsupported status");
      const action = next === "approved" ? "approve" : "deny";
      setPendingActionId(id);
      await apiPost(`/api/requests/${id}/${action}`, {});
      const updated = await apiGet("/api/requests");
      setItems(updated);
      await fetchApprovalsFor(updated, { replace: true });
      toast.success(next === "approved" ? "Approval recorded" : "Denial recorded");
    } catch (err) {
      console.error(err);
      toast.error(friendlyApiError(err));
    } finally { setPendingActionId(null); }
  }

  return (
    <div className="space-y-4">
      {/* sticky subheader */}
      <div className="sticky top-3 z-10 glass border border-slate-200 rounded-2xl p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-2">
            {chips.map(c => <Chip key={c} active={status===c} onClick={()=>setStatus(c)}>{c[0].toUpperCase()+c.slice(1)}</Chip>)}
          </div>
          <div className="md:ml-auto">
            <input className="rounded-lg border px-3 py-2 text-sm w-64" placeholder="Search title, amount, category…" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <Button className="md:ml-2" onClick={()=>setOpen(true)}>New request</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Requests" subtitle="Track status and manage approvals" />
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
                {!loading && filtered.map(i => {
                  const stageEntry = approvalStages[i.id];
                  const pendingStage = pendingStageFor(i.id);
                  const canAct = canActOnStage({
                    request: i,
                    pendingStage,
                    userRole,
                  });
                  const message = renderStageMessage({
                    request: i,
                    stageEntry,
                    pendingStage,
                    userRole,
                  });
                  return (
                    <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <Td><Link className="text-blue-700 underline" to={`/app/requests/${i.id}`}>{i.title}</Link></Td>
                      <Td align="right">${Number(i.amount).toFixed(2)}</Td>
                      <Td align="center">{i.category_name || "—"}</Td>
                      <Td align="center"><Badge status={i.status} /></Td>
                      <Td>
                        {i.status !== "pending" ? (
                          <span className="text-xs text-slate-500">No actions</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                onClick={()=>setStage(i.id,'approved')}
                                disabled={
                                  pendingActionId === i.id ||
                                  !canAct
                                }
                              >Approve</Button>
                              <Button
                                variant="ghost"
                                onClick={()=>setStage(i.id,'denied')}
                                disabled={
                                  pendingActionId === i.id ||
                                  !canAct
                                }
                              >Deny</Button>
                            </div>
                            {message}
                          </div>
                        )}
                      </Td>
                    </tr>
                  );
                })}
                {!loading && !filtered.length && (
                  <tr><Td colSpan="5" className="text-slate-500">No matching requests — try clearing filters or create the first one.</Td></tr>
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

function canActOnStage({ request, pendingStage, userRole }) {
  if (!request || request.status !== "pending") return false;
  if (!userRole) return false;
  if (userRole === "admin") return true;
  if (!pendingStage || !pendingStage.role_required) return false;
  return pendingStage.role_required === userRole;
}

function renderStageMessage({ request, stageEntry, pendingStage, userRole }) {
  if (!request || request.status !== "pending") return null;
  const base = "text-xs text-slate-500";

  if (stageEntry === null) {
    return <div className={base}>Approval routing unavailable.</div>;
  }
  if (typeof stageEntry === "undefined") {
    return <div className={base}>Loading approval routing…</div>;
  }
  if (!pendingStage) {
    return <div className={base}>No pending stage.</div>;
  }
  if (!userRole) {
    return <div className={base}>Checking permissions…</div>;
  }
  if (userRole === "admin") {
    const roleLabel = formatRole(pendingStage.role_required);
    return (
      <div className={base}>
        Admin override available for {roleLabel ? `${roleLabel} stage` : "this stage"}.
      </div>
    );
  }
  if (pendingStage.role_required && pendingStage.role_required !== userRole) {
    const roleLabel = formatRole(pendingStage.role_required);
    return <div className={base}>Waiting on {roleLabel || "another role"}</div>;
  }
  const roleLabel = formatRole(pendingStage.role_required || userRole);
  return (
    <div className={base}>
      {roleLabel ? `You're assigned as ${roleLabel}.` : "You can act on this stage."}
    </div>
  );
}

function formatRole(role) {
  if (!role) return "";
  return role
    .toString()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseApiError(err) {
  const message = typeof err === "string" ? err : err?.message || "";
  if (!message) return null;
  const parts = message.split("::");
  if (parts.length > 1) {
    const jsonPart = parts[parts.length - 1].trim();
    try {
      const parsed = JSON.parse(jsonPart);
      if (parsed && typeof parsed.error === "string") return parsed.error;
    } catch (_) {
      /* ignore parse errors */
    }
  }
  if (message.includes(" 403 ")) return "Not authorized for this stage";
  if (message.includes(" 400 ")) return "No pending stage";
  if (message.toLowerCase().includes("failed to fetch")) return "Network error";
  return null;
}

function friendlyApiError(err) {
  const raw = parseApiError(err);
  if (raw === "wrong role for this stage" || raw === "Not authorized for this stage")
    return "This request is waiting on another role.";
  if (raw === "No pending stage" || raw === "no pending stage")
    return "No pending stage to act on.";
  if (raw) return raw;
  return "Update failed";
}
