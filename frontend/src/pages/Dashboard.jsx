import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api";
import { Card, CardBody } from "../components/Card";
import Badge from "../components/Badge";
import { motion } from "framer-motion";

export default function Dashboard(){
  const [reqs,setReqs]=useState([]); const [cats,setCats]=useState([]);
  useEffect(()=>{ (async()=>{ try{
    const [r,c]=await Promise.all([apiGet("/api/requests"), apiGet("/api/categories")]);
    setReqs(r); setCats(c);
  }catch{} })(); },[]);

  const kpi = useMemo(()=>({
    total:reqs.length,
    approved:reqs.filter(r=>r.status==='approved').length,
    pending:reqs.filter(r=>r.status==='pending').length,
    denied:reqs.filter(r=>r.status==='denied').length,
  }),[reqs]);

  const recent = useMemo(()=>[...reqs].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5),[reqs]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 border border-slate-200">
        <div className="px-6 py-10 md:px-8 md:py-12">
          <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
            className="text-2xl md:text-3xl font-semibold tracking-tight">
            Purchase requests that approve themselves*
          </motion.h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Intake once. Policy routes it to the right people. Vendor & budgets stay in sync.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="/requests" className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">Create request</a>
            <a href="/approvals" className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-white/70">Review approvals</a>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi title="Total" value={kpi.total}/>
        <Kpi title="Approved" value={kpi.approved}/>
        <Kpi title="Pending" value={kpi.pending}/>
        <Kpi title="Denied" value={kpi.denied}/>
      </section>

      {/* HOW IT WORKS */}
      <section className="grid md:grid-cols-3 gap-4">
        <Step n="1" title="Intake any request" text="Drop a quote or type a title & amount. Attach vendor & category."/>
        <Step n="2" title="Policy routes it" text="Rules pick approvers by amount/category/vendor risk."/>
        <Step n="3" title="PO/invoice ready" text="Auto-carry details to PO; upload receipts to match later."/>
      </section>

      {/* LIVE SNAPSHOT */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card className="hover-card">
          <CardBody>
            <h3 className="font-semibold mb-3">Recent requests</h3>
            <div className="divide-y">
              {recent.map(r=>(
                <a key={r.id} href={`/requests/${r.id}`} className="flex items-center justify-between py-2.5 hover:bg-slate-50 rounded-md px-2 -mx-2 transition">
                  <div className="truncate">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.category_name || '—'} • {new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">${Number(r.amount).toFixed(2)}</div>
                    <Badge status={r.status}/>
                  </div>
                </a>
              ))}
              {!recent.length && <div className="text-slate-500 py-8 text-center">No requests yet.</div>}
            </div>
          </CardBody>
        </Card>

        <Card className="hover-card">
          <CardBody>
            <h3 className="font-semibold mb-3">Budgets this month</h3>
            <div className="space-y-3">
              {cats.length === 0 && <div className="text-slate-500">No categories yet.</div>}
              {cats.map(c=>{
                const spent = reqs.filter(r=>r.category_id===c.id && r.status==='approved')
                  .reduce((s,r)=>s+Number(r.amount||0),0);
                const pct = c.monthly_budget>0 ? Math.min(100, Math.round(spent/Number(c.monthly_budget)*100)) : 0;
                const bar = pct>=100 ? "bg-red-500" : pct>=80 ? "bg-amber-500" : "bg-blue-600";
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-slate-600">${spent.toFixed(2)} / ${Number(c.monthly_budget).toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full ${bar}`} style={{ width: pct+'%' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </section>

      <p className="text-xs text-slate-500">*not literally, but you’ll feel like it.</p>
    </div>
  );
}

function Kpi({title,value}){ return (
  <Card><CardBody>
    <div className="text-xs text-slate-500">{title}</div>
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-2xl font-bold">{value}</motion.div>
  </CardBody></Card>
);}

function Step({n,title,text}){ return (
  <Card className="hover-card"><CardBody>
    <div className="text-xs text-slate-500 mb-1">Step {n}</div>
    <div className="font-semibold">{title}</div>
    <p className="text-slate-600 text-sm mt-1">{text}</p>
  </CardBody></Card>
);}

// (Optional) Below your LIVE SNAPSHOT section, add:
{recent.length > 0 && (
  <Card className="hover-card">
    <CardBody>
      <h3 className="font-semibold mb-3">Activity</h3>
      <ul className="space-y-2 text-sm text-slate-700">
        {recent.map(r=>(
          <li key={r.id} className="flex items-center justify-between">
            <span className="truncate">{r.title}</span>
            <span className="text-slate-500">${Number(r.amount).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </CardBody>
  </Card>
)}
