import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Drawer from "../components/Drawer";
import { Tabs } from "../components/Tabs";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { apiGet, apiUpload, apiPost } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../components/toast";

export default function RequestDetailDrawer({ open, onClose }) {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [req, setReq] = useState(null);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [file, setFile] = useState(null);
  const [audit, setAudit] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState();
  const [acting, setActing] = useState(null);

  const userRole = user?.role || "";

  async function load() {
    setLoading(true);
    setStages(undefined);
    try{
      const [list, st, cm, au, ap] = await Promise.all([
        apiGet("/api/requests"),
        apiGet(`/api/requests/${id}/files`).catch(()=>[]),
        apiGet(`/api/requests/${id}/comments`).catch(()=>[]),
        apiGet(`/api/requests/${id}/audit`).catch(()=>[]),
        apiGet(`/api/requests/${id}/approvals`).catch((err) => {
          console.error(`Failed to load approvals for request ${id}`, err);
          return null;
        })
      ]);
      setReq(list.find(r=> String(r.id)===String(id)) || null);
      setFiles(st||[]); setComments(cm||[]); setAudit(au||[]);
      setStages(ap);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ if(open) load(); }, [id, open]);

  async function upload() {
    if (!file) return;
    await apiUpload(`/api/requests/${id}/files`, file);
    setFile(null);
    setFiles(await apiGet(`/api/requests/${id}/files`));
  }

  async function postComment(){
    if (!newComment.trim()) return;
    await apiPost(`/api/requests/${id}/comments`, { body: newComment.trim() });
    setNewComment("");
    setComments(await apiGet(`/api/requests/${id}/comments`));
  }

  async function approve(){
    setActing("approve");
    try {
      await apiPost(`/api/requests/${id}/approve`, {});
      toast?.success("Approval recorded");
      await load();
    } catch (err) {
      console.error(err);
      toast?.error(friendlyApiError(err, "Approve failed"));
    } finally {
      setActing(null);
    }
  }

  async function deny(){
    setActing("deny");
    try {
      await apiPost(`/api/requests/${id}/deny`, {});
      toast?.info("Denial recorded");
      await load();
    } catch (err) {
      console.error(err);
      toast?.error(friendlyApiError(err, "Deny failed"));
    } finally {
      setActing(null);
    }
  }

  const pendingStage = useMemo(() => {
    if (!Array.isArray(stages)) return null;
    return stages.find((stage) => stage.status === "pending") || null;
  }, [stages]);
  const totalStages = Array.isArray(stages) ? stages.length : 0;
  const canAct = canActOnStage({ request: req, pendingStage, userRole });
  const stageMessage = renderDetailStageMessage({
    request: req,
    stages,
    pendingStage,
    userRole,
    totalStages,
  });
  const isActing = acting !== null;

  return (
    <Drawer open={open} title={req ? `Request #${req.id}` : "Request"} onClose={onClose}
      footer={<Button onClick={onClose}>Close</Button>}>
      {loading || !req ? <div className="text-slate-600">Loading…</div> : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold truncate">{req.title}</div>
            <Badge status={req.status}/>
          </div>
          <Tabs tabs={["Overview","Files","Comments","Timeline"]} current={tab} onChange={setTab} />

          {tab==="Overview" && (
            <div className="space-y-2">
              <Row k="Amount" v={`$${Number(req.amount).toFixed(2)}`} />
              <Row k="Category" v={req.category_name || "—"} />
              <Row k="Vendor" v={req.vendor_name || "—"} />
              <Row k="PO Number" v={req.po_number || "—"} />
              <Row k="Created" v={new Date(req.created_at).toLocaleString()} />
              <div className="space-y-1">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={approve}
                    disabled={!canAct || isActing}
                  >Approve</Button>
                  <Button
                    variant="ghost"
                    onClick={deny}
                    disabled={!canAct || isActing}
                  >Deny</Button>
                </div>
                {stageMessage}
              </div>
            </div>
          )}

          {tab==="Files" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="rounded-lg border px-3 py-2" />
                <Button variant="ghost" onClick={upload} disabled={!file}>Upload</Button>
              </div>
              <ul className="space-y-2 text-sm">
                {files.map(f => (
                  <li key={f.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="truncate">{f.filename}</span>
                    <a className="text-blue-700 underline" href={f.url} target="_blank" rel="noreferrer">view</a>
                  </li>
                ))}
                {!files.length && <li className="text-slate-500">No files yet.</li>}
              </ul>
            </div>
          )}

          {tab==="Comments" && (
            <div className="space-y-3">
              <form onSubmit={e=>{e.preventDefault(); postComment();}} className="flex items-center gap-2">
                <input className="flex-1 rounded-lg border px-3 py-2" placeholder="Add a comment…" value={newComment} onChange={e=>setNewComment(e.target.value)} />
                <Button type="submit" disabled={!newComment.trim()}>Post</Button>
              </form>
              <ul className="space-y-2 text-sm">
                {comments.map(c=>(
                  <li key={c.id} className="rounded-lg border px-3 py-2">
                    <div className="text-slate-800">{c.body}</div>
                    <div className="text-xs text-slate-500 mt-1">{c.author || "Unknown"} • {new Date(c.created_at).toLocaleString()}</div>
                  </li>
                ))}
                {!comments.length && <li className="text-slate-500">No comments yet.</li>}
              </ul>
            </div>
          )}

          {tab==="Timeline" && (
            <ul className="space-y-2 text-sm">
              {audit.map((t,i)=>(
                <li key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 capitalize">
                  <span>{t.action}</span>
                  <span className="text-slate-600">{new Date(t.created_at).toLocaleString()}</span>
                </li>
              ))}
              {!audit.length && <li className="text-slate-500">No events yet.</li>}
            </ul>
          )}
        </div>
      )}
    </Drawer>
  );
}

function canActOnStage({ request, pendingStage, userRole }) {
  if (!request || request.status !== "pending") return false;
  if (!userRole) return false;
  if (userRole === "admin") return true;
  if (!pendingStage || !pendingStage.role_required) return false;
  return pendingStage.role_required === userRole;
}

function renderDetailStageMessage({ request, stages, pendingStage, userRole, totalStages }) {
  if (!request) return null;
  const base = "text-xs text-slate-500";

  if (request.status !== "pending") {
    if (request.status === "approved")
      return <div className={base}>All approval stages completed.</div>;
    if (request.status === "denied")
      return <div className={base}>Request has been denied.</div>;
    return <div className={base}>No approval actions available.</div>;
  }

  if (stages === null) return <div className={base}>Approval routing unavailable.</div>;
  if (typeof stages === "undefined")
    return <div className={base}>Loading approval routing…</div>;

  if (!pendingStage) {
    if (Array.isArray(stages) && stages.every((stage) => stage.status === "approved"))
      return <div className={base}>All stages are complete.</div>;
    return <div className={base}>No pending stage.</div>;
  }

  const rawIndex = Number(pendingStage.stage_index);
  const stageNumber = Number.isFinite(rawIndex) ? rawIndex + 1 : null;
  const stagePrefix =
    stageNumber !== null
      ? totalStages > 0
        ? `Stage ${stageNumber} of ${totalStages}`
        : `Stage ${stageNumber}`
      : "Current stage";
  const roleLabel = formatRole(pendingStage.role_required);

  if (!userRole)
    return <div className={base}>{`${stagePrefix}: checking permissions…`}</div>;

  if (userRole === "admin") {
    const suffix = roleLabel ? `for ${roleLabel}.` : "for this stage.";
    return <div className={base}>{`${stagePrefix}: admin override available ${suffix}`}</div>;
  }

  if (pendingStage.role_required && pendingStage.role_required !== userRole) {
    return (
      <div className={base}>{`${stagePrefix}: waiting on ${roleLabel || "another role"}.`}</div>
    );
  }

  if (roleLabel)
    return <div className={base}>{`${stagePrefix}: you're assigned as ${roleLabel}.`}</div>;

  return <div className={base}>{`${stagePrefix}: you can act on this stage.`}</div>;
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

function friendlyApiError(err, fallback = "Action failed") {
  const raw = parseApiError(err);
  if (raw === "wrong role for this stage" || raw === "Not authorized for this stage")
    return "This request is waiting on another role.";
  if (raw === "No pending stage" || raw === "no pending stage")
    return "No pending stage to act on.";
  if (raw) return raw;
  return fallback;
}

function Row({ k, v }){ return (
  <div className="flex items-center justify-between">
    <div className="text-sm text-slate-500">{k}</div>
    <div className="text-sm font-medium">{v}</div>
  </div>
); }
