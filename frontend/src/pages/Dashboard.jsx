import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { Card, CardBody } from "../components/Card";
import Counter from "../components/Counter";
import Badge from "../components/Badge";
import { motion } from "framer-motion";

export default function Dashboard(){
  const [reqs,setReqs]=useState([]);
  const [cats,setCats]=useState([]);

  useEffect(()=>{ (async()=>{
    try {
      const [r,c]=await Promise.all([apiGet("/api/requests"), apiGet("/api/categories")]);
      setReqs(r); setCats(c);
    } catch {}
  })(); },[]);

  const kpi = useMemo(()=>({
    total:reqs.length,
    approved:reqs.filter(r=>r.status==='approved').length,
    pending:reqs.filter(r=>r.status==='pending').length,
    denied:reqs.filter(r=>r.status==='denied').length,
  }),[reqs]);

  // 👇 this is what was missing
  const recent = useMemo(()=>{
    return [...reqs].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5);
  },[reqs]);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi title="Total" value={kpi.total}/>
        <Kpi title="Approved" value={kpi.approved}/>
        <Kpi title="Pending" value={kpi.pending}/>
        <Kpi title="Denied" value={kpi.denied}/>
      </section>

      <Card>
        <CardBody>
          <h3 className="font-semibold mb-3">Recent requests</h3>
          <div className="divide-y">
            {recent.map(r=>(
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.category_name || '—'} • {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">${Number(r.amount).toFixed(2)}</div>
                  <Badge status={r.status}/>
                </div>
              </div>
            ))}
            {!recent.length && <div className="text-slate-500 py-8 text-center">No requests yet.</div>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Kpi({title,value}){ 
  return (
    <Card><CardBody>
      <div className="text-xs text-slate-500">{title}</div>
      <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-2xl font-bold">
        <Counter value={value}/>
      </motion.div>
    </CardBody></Card>
  );
}
