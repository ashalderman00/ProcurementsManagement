import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/Card";
import Button from "../components/Button";

function Risk({ level }) {
  const map = { low:"bg-green-100 text-green-700", medium:"bg-amber-100 text-amber-800", high:"bg-red-100 text-red-700" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[level]||"bg-slate-100 text-slate-700"}`}>{level||"—"}</span>;
}

export default function Vendors(){
  const [items,setItems]=useState([]);
  const [q,setQ]=useState("");
  useEffect(()=>{ (async()=>{ try{
    const res = await fetch("/api/vendors"); const data = await res.json(); setItems(data);
  }catch{}})(); },[]);
  const filtered = items.filter(v=> v.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Vendors" subtitle="Directory of active suppliers" actions={<input className="rounded-lg border px-3 py-2 text-sm" placeholder="Search vendors…" value={q} onChange={e=>setQ(e.target.value)} />} />
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
                  <Button variant="ghost" onClick={()=>location.href='/requests?vendor='+v.id}>Create request</Button>
                  <Button variant="ghost" onClick={()=>alert('Block/Unblock coming soon')}>{v.status==='blocked'?'Unblock':'Block'}</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
