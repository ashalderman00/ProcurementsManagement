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
  const [timeline, setTimeline] = useState([]);

  async function load() {
    const list = await apiGet("/api/requests");
    const match = list.find(r => String(r.id) === String(id));
    setReq(match || null);
    try { setFiles(await apiGet(`/api/requests/${id}/files`)); } catch {}
    // very simple timeline from approvals if available
    try { 
      const stages = await apiGet(`/api/requests/${id}/approvals`);
      setTimeline(stages.map(s => ({
        label: `Stage ${s.stage_index+1} • ${s.role_required}`,
        status: s.status,
        when: s.acted_at
      })));
    } catch { setTimeline([]); }
  }
  useEffect(()=>{ if(open) load(); }, [id, open]);

  async function upload() {
    if (!file) return;
    await apiUpload(`/api/requests/${id}/files`, file);
    setFile(null);
    setFiles(await apiGet(`/api/requests/${id}/files`));
  }

  return (
    <Drawer open={open} title={req ? `Request #${req.id}` : "Request"} onClose={onClose}
      footer={<Button onClick={onClose}>Close</Button>}>
      {!req ? <div className="text-slate-600">Loading…</div> : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold truncate">{req.title}</div>
            <Badge status={req.status}/>
          </div>
          <Tabs tabs={["Overview","Files","Timeline"]} current={tab} onChange={setTab} />

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

          {tab==="Timeline" && (
            <ul className="space-y-2 text-sm">
              {timeline.map((t,i)=>(
                <li key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span>{t.label}</span>
                  <span className="text-slate-600">{t.status}{t.when ? ` • ${new Date(t.when).toLocaleString()}` : ""}</span>
                </li>
              ))}
              {!timeline.length && <li className="text-slate-500">No events yet.</li>}
            </ul>
          )}
        </div>
      )}
    </Drawer>
  );
}
function Row({ k, v }) {
  return <div className="flex items-center justify-between">
    <div className="text-sm text-slate-500">{k}</div>
    <div className="text-sm font-medium">{v}</div>
  </div>;
}
