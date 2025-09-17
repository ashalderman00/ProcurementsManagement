import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Drawer from "../components/Drawer";
import { Tabs } from "../components/Tabs";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { apiGet, apiUpload } from "../lib/api";

export default function RequestDetailDrawer({ open, onClose }) {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [file, setFile] = useState(null);
  const [audit, setAudit] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try{
      const [list, st, cm, au] = await Promise.all([
        apiGet("/api/requests"),
        apiGet(`/api/requests/${id}/files`).catch(()=>[]),
        apiGet(`/api/requests/${id}/comments`).catch(()=>[]),
        apiGet(`/api/requests/${id}/audit`).catch(()=>[])
      ]);
      setReq(list.find(r=> String(r.id)===String(id)) || null);
      setFiles(st||[]); setComments(cm||[]); setAudit(au||[]);
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
    const token = localStorage.getItem("token")||"";
    const res = await fetch(`/api/requests/${id}/comments`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ body: newComment })
    });
    if (!res.ok) return alert("Comment failed");
    setNewComment("");
    setComments(await apiGet(`/api/requests/${id}/comments`));
  }

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
              <a href={`/requests`} className="text-blue-700 underline">Open in Requests</a>
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
                <li key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="capitalize">{t.action}</span>
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
function Row({ k, v }){ return (
  <div className="flex items-center justify-between">
    <div className="text-sm text-slate-500">{k}</div>
    <div className="text-sm font-medium">{v}</div>
  </div>
); }
