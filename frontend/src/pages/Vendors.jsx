import { useEffect, useState } from "react";
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
  const [open,setOpen]=useState(false);
  const [current,setCurrent]=useState(null);

  async function load(){ try{ setItems(await apiGet("/api/vendors")); }catch{} }
  useEffect(()=>{ load(); },[]);
  const filtered = items.filter(v=> v.name.toLowerCase().includes(q.toLowerCase()));

  function openVendor(v){ setCurrent(v); setOpen(true); }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Vendors" subtitle="Directory of active suppliers"
          actions={<input className="rounded-lg border px-3 py-2 text-sm" placeholder="Search vendors…" value={q} onChange={e=>setQ(e.target.value)} />} />
        <CardBody>
          {filtered.length===0 && <div className="text-slate-500">No vendors match.</div>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(v=>(
              <div key={v.id} className="card hover-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{v.name}</div>
                  <Risk level={v.risk}/>
                </div>
                {v.website && <a className="text-blue-700 underline text-sm" href={v.website} target="_blank" rel="noreferrer">{v.website}</a>}
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" onClick={()=>openVendor(v)}>Open</Button>
                  <Button variant="ghost" onClick={()=>location.href='/app/requests?vendor='+v.id}>Create request</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <VendorDrawer open={open} vendor={current} onClose={()=>{ setOpen(false); load(); }} />
    </div>
  );
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
