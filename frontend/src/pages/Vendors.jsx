import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/Card";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import { apiGet } from "../lib/api";

function Risk({ level }) {
  const map = { low:"bg-green-100 text-green-700", medium:"bg-amber-100 text-amber-800", high:"bg-red-100 text-red-700" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[level]||"bg-slate-100 text-slate-700"}`}>{level||"—"}</span>;
}

export default function Vendors(){
  const [items,setItems]=useState([]);
  const [q,setQ]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [riskFilter,setRiskFilter]=useState("all");
  const [open,setOpen]=useState(false);
  const [current,setCurrent]=useState(null);

  async function load(){ try{ setItems(await apiGet("/api/vendors")); }catch{} }
  useEffect(()=>{ load(); },[]);

  const summary = useMemo(()=>{
    const base = {
      total: items.length,
      active: 0,
      blocked: 0,
      low: 0,
      medium: 0,
      high: 0
    };
    for(const vendor of items){
      if(vendor?.status && vendor.status in base){
        base[vendor.status]+=1;
      }
      if(vendor?.risk && vendor.risk in base){
        base[vendor.risk]+=1;
      }
    }
    return base;
  },[items]);

  const filtered = useMemo(()=>
    items.filter(v=>{
      if(!v || !v.name) return false;
      const matchesName = v.name.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = statusFilter==="all" || v.status===statusFilter;
      const matchesRisk = riskFilter==="all" || v.risk===riskFilter;
      return matchesName && matchesStatus && matchesRisk;
    })
  ,[items,q,statusFilter,riskFilter]);

  function openVendor(v){ setCurrent(v); setOpen(true); }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Vendors" subtitle="Directory of active suppliers"
          actions={<div className="flex flex-wrap items-center justify-end gap-2">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Search vendors…" value={q} onChange={e=>setQ(e.target.value)} />
            <select className="rounded-lg border px-3 py-2 text-sm" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <select className="rounded-lg border px-3 py-2 text-sm" value={riskFilter} onChange={e=>setRiskFilter(e.target.value)} aria-label="Filter by risk">
              <option value="all">All risk levels</option>
              <option value="low">Low risk</option>
              <option value="medium">Medium risk</option>
              <option value="high">High risk</option>
            </select>
          </div>} />
        <CardBody className="space-y-4">
          {items.length>0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryTile label="Total vendors" value={summary.total} />
                <SummaryTile label="Active" value={summary.active} />
                <SummaryTile label="Blocked" value={summary.blocked} />
                <SummaryTile label="High risk" value={summary.high} />
              </div>
              {filtered.length===0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-slate-500">
                  No vendors match the current filters.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map(v=>{
                    const addedOn = formatDate(v.created_at);
                    return (
                      <div key={v.id} className="card hover-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold">{v.name}</div>
                          <div className="flex items-center gap-2">
                            <Status value={v.status} />
                            <Risk level={v.risk}/>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {addedOn ? `Added ${addedOn}` : "Added —"}
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          {v.website ? (
                            <a className="text-blue-700 underline" href={v.website} target="_blank" rel="noreferrer">
                              {v.website}
                            </a>
                          ) : (
                            <span className="text-slate-400">No website provided</span>
                          )}
                          <p className="leading-relaxed">{renderNotesPreview(v.notes)}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">Vendor ID {v.id}</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={()=>openVendor(v)}>Open</Button>
                            <Button variant="ghost" onClick={()=>location.href='/app/requests?vendor='+v.id}>Create request</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-slate-500">
              No vendors have been added yet.
            </div>
          )}
        </CardBody>
      </Card>

      <VendorDrawer open={open} vendor={current} onClose={()=>{ setOpen(false); load(); }} />
    </div>
  );
}

function SummaryTile({ label, value }){
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900">{value ?? 0}</div>
    </div>
  );
}

function Status({ value }){
  const map = {
    active:"bg-emerald-100 text-emerald-700",
    blocked:"bg-slate-200 text-slate-700"
  };
  const label = value ? value.charAt(0).toUpperCase()+value.slice(1) : "—";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[value]||"bg-slate-100 text-slate-700"}`}>{label}</span>;
}

function formatDate(value){
  if(!value) return "";
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", year:"numeric" }).format(date);
}

function renderNotesPreview(notes){
  if(!notes) return "No notes captured yet.";
  const trimmed = String(notes).trim();
  if(!trimmed) return "No notes captured yet.";
  if(trimmed.length<=160) return trimmed;
  return trimmed.slice(0,157)+"…";
}

function VendorDrawer({ open, vendor, onClose }){
  const [detail,setDetail]=useState(null);
  const [notes,setNotes]=useState("");
  const [status,setStatus]=useState("active");
  const [risk,setRisk]=useState("low");
  useEffect(()=>{ (async()=>{
    if(!open||!vendor) return;
    try{
      const d = await apiGet(`/api/vendors/${vendor.id}`);
      setDetail(d); setNotes(d.notes||""); setStatus(d.status||"active"); setRisk(d.risk||"low");
    }catch{}
  })(); },[open, vendor]);

  async function save(){
    const token = localStorage.getItem("token")||"";
    await fetch(`/api/vendors/${vendor.id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ notes, status, risk })
    });
    onClose?.();
  }
  if(!detail) return <Drawer open={open} title="Vendor" onClose={onClose}><div className="text-slate-600">Loading…</div></Drawer>;
  return (
    <Drawer open={open} title={`Vendor: ${detail.name}`} onClose={onClose}
      footer={<div className="flex justify-between">
        <Button variant="ghost" onClick={()=>{ setStatus(status==='blocked'?'active':'blocked'); }}>{status==='blocked'?'Unblock':'Block'}</Button>
        <Button onClick={save}>Save</Button>
      </div>}>
      <div className="space-y-3">
        <div className="text-sm"><b>Risk</b>: {detail.risk}</div>
        <div className="text-sm"><b>Status</b>: {status}</div>
        {detail.website && <div className="text-sm"><b>Website</b>: <a className="underline text-blue-700" href={detail.website} target="_blank" rel="noreferrer">{detail.website}</a></div>}
        <div>
          <div className="text-sm text-slate-600 mb-1">Notes</div>
          <textarea className="w-full rounded-lg border px-3 py-2 h-28" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
      </div>
    </Drawer>
  );
}
