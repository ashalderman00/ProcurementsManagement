import { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import Button from "../components/Button";
import { apiGet, apiPost } from "../lib/api";

export default function RuleEditor({ open, onClose }) {
  const [cats, setCats] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [name,setName]=useState("");
  const [min,setMin]=useState("0");
  const [max,setMax]=useState("");
  const [categoryId,setCategoryId]=useState("");
  const [vendorId,setVendorId]=useState("");
  const [stagesText,setStagesText]=useState('["approver"]');

  useEffect(()=>{
    (async()=>{
      try {
        setCats(await apiGet("/api/categories"));
      } catch {}
      try {
        setVendors(await apiGet("/api/vendors"));
      } catch {}
    })();
  },[open]);

  async function save(){
    const stages = JSON.parse(stagesText||"[]");
    await apiPost("/api/approval-rules", {
      name,
      min_amount: Number(min||0),
      max_amount: max===""? null : Number(max),
      category_id: categoryId? Number(categoryId) : null,
      vendor_id: vendorId? Number(vendorId) : null,
      stages
    });
    onClose?.();
  }

  return (
    <Drawer open={open} title="New approval rule"
      onClose={onClose}
      footer={<Button onClick={save}>Save rule</Button>}>
      <div className="space-y-3">
        <Field label="Name"><input className="w-full rounded-lg border px-3 py-2" value={name} onChange={e=>setName(e.target.value)} placeholder="Default $0–$1k"/></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min amount"><input className="w-full rounded-lg border px-3 py-2" type="number" value={min} onChange={e=>setMin(e.target.value)} /></Field>
          <Field label="Max amount"><input className="w-full rounded-lg border px-3 py-2" type="number" value={max} onChange={e=>setMax(e.target.value)} placeholder="(no limit)" /></Field>
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
        <p className="text-xs text-slate-500">Tip: roles supported: requester, approver, admin (your policy can be any sequence).</p>
      </div>
    </Drawer>
  );
}
function Field({label,children}){ return (
  <div><div className="text-sm text-slate-600 mb-1">{label}</div>{children}</div>
); }
