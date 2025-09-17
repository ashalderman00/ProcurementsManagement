import { useEffect, useState } from "react";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import { apiGet, apiPost } from "../lib/api";

export default function Settings() {
  const [rules,setRules]=useState([]);
  const [open,setOpen]=useState(false);

  async function load(){ try{ setRules(await apiGet("/api/approval-rules")); }catch{} }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Approval Rules</h2>
        <Button onClick={()=>setOpen(true)}>New rule</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-100">
              <Th>Name</Th><Th>Amount range</Th><Th>Category</Th><Th>Vendor</Th><Th>Stages</Th><Th>Active</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r=>(
              <RuleRow key={r.id} rule={r} onChanged={load}/>
            ))}
            {!rules.length && <tr><td colSpan="7" className="p-4 text-slate-500">No rules yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <RuleEditor open={open} onClose={()=>{ setOpen(false); load(); }}/>
    </div>
  );
}

function Th({children}){ return <th className="px-3 py-2 font-medium text-slate-600 text-left">{children}</th> }
function Td({children}){ return <td className="px-3 py-2">{children}</td> }

function RuleRow({ rule, onChanged }) {
  const [editing,setEditing]=useState(false);
  async function del(){
    if (!confirm("Delete this rule?")) return;
    await fetch(`/api/approval-rules/${rule.id}`, { method:"DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")||""}` }});
    onChanged();
  }
  return (
    <tr className="border-b border-slate-100">
      <Td>{rule.name}</Td>
      <Td>{Number(rule.min_amount).toFixed(2)} – {rule.max_amount===null? "∞" : Number(rule.max_amount).toFixed(2)}</Td>
      <Td>{rule.category_id||"Any"}</Td>
      <Td>{rule.vendor_id||"Any"}</Td>
      <Td><code>{Array.isArray(rule.stages)? rule.stages.join(" → ") : JSON.parse(rule.stages||"[]").join(" → ")}</code></Td>
      <Td>{String(rule.active)}</Td>
      <Td>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={()=>setEditing(true)}>Edit</Button>
          <Button variant="ghost" onClick={del}>Delete</Button>
        </div>
        {editing && <RuleEditor open={editing} onClose={()=>{ setEditing(false); onChanged(); }} rule={rule}/>}
      </Td>
    </tr>
  );
}

function RuleEditor({ open, onClose, rule }) {
  const [cats,setCats]=useState([]);
  const [vendors,setVendors]=useState([]);
  const [name,setName]=useState(rule?.name||"");
  const [min,setMin]=useState(String(rule?.min_amount??0));
  const [max,setMax]=useState(rule?.max_amount===null? "" : String(rule?.max_amount??""));
  const [categoryId,setCategoryId]=useState(rule?.category_id??"");
  const [vendorId,setVendorId]=useState(rule?.vendor_id??"");
  const [stagesText,setStagesText]=useState(
    Array.isArray(rule?.stages)? JSON.stringify(rule.stages) :
    (rule?.stages || '["approver"]')
  );
  const [active,setActive]=useState(Boolean(rule?.active ?? true));

  useEffect(()=>{ (async()=>{
    try { setCats(await apiGet("/api/categories")); } catch {}
    try { setVendors(await apiGet("/api/vendors")); } catch {}
  })(); },[]);

  async function save(){
    const stages = JSON.parse(stagesText||"[]");
    const body = {
      name, min_amount:Number(min||0),
      max_amount: (max===""? null : Number(max)),
      category_id: categoryId===""? null : Number(categoryId),
      vendor_id: vendorId===""? null : Number(vendorId),
      stages, active
    };
    const token = localStorage.getItem("token")||"";
    if (rule) {
      await fetch(`/api/approval-rules/${rule.id}`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(body)
      });
    } else {
      await apiPost("/api/approval-rules", body);
    }
    onClose?.();
  }

  return (
    <Drawer open={open} title={rule? "Edit rule" : "New approval rule"} onClose={onClose}
      footer={<Button onClick={save}>{rule? "Save" : "Create"}</Button>}>
      <div className="space-y-3">
        <Field label="Name"><input className="w-full rounded-lg border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Default $0–$1k" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min amount"><input className="w-full rounded-lg border px-3 py-2" type="number" value={min} onChange={e=>setMin(e.target.value)} /></Field>
          <Field label="Max amount (blank = no limit)"><input className="w-full rounded-lg border px-3 py-2" type="number" value={max} onChange={e=>setMax(e.target.value)} placeholder=""/></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className="w-full rounded-lg border px-3 py-2" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
              <option value="">Any</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Vendor">
            <select className="w-full rounded-lg border px-3 py-2" value={vendorId} onChange={e=>setVendorId(e.target.value)}>
              <option value="">Any</option>{vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label='Stages (JSON, e.g. ["approver","admin"])'>
          <input className="w-full rounded-lg border px-3 py-2 font-mono text-sm" value={stagesText} onChange={e=>setStagesText(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} /> Active
        </label>
      </div>
    </Drawer>
  );
}
function Field({label,children}){ return <div><div className="text-sm text-slate-600 mb-1">{label}</div>{children}</div>; }
