import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch, apiUpload } from "../lib/api";
import { Card, CardBody, CardHeader } from "../components/Card";
import { T, Th, Td } from "../components/Table";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Drawer from "../components/Drawer";
import FAB from "../components/FAB";
import Chip from "../components/Chip";
import { useToast } from "../components/toast";

export default function Requests() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const chips = ["all","approved","pending","denied"];

  // drawer state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [data, c] = await Promise.all([apiGet("/api/requests"), apiGet("/api/categories")]);
      setItems(data); setCats(c);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(i => {
      const okStatus = status==="all" ? true : i.status===status;
      const okText = !term ? true :
        i.title.toLowerCase().includes(term) ||
        String(i.amount).includes(term) ||
        (i.category_name||"").toLowerCase().includes(term);
      return okStatus && okText;
    });
  }, [items, q, status]);

  async function create(e) {
    e?.preventDefault();
    try {
      const created = await apiPost("/api/requests", {
        title, amount: Number(amount), category_id: categoryId ? Number(categoryId) : null
      });
      if (file) await apiUpload("/api/requests/"+created.id+"/files", file);
      setItems([created, ...items]);
      setTitle(""); setAmount(""); setCategoryId(""); setFile(null); setOpen(false);
      toast.success("Request created");
    } catch { toast.error("Create failed"); }
  }

  async function setStage(id, next) {
    try {
      const updated = await apiPatch("/api/requests/" + id, { status: next });
      setItems(items.map(i => i.id === id ? updated : i));
      toast.success("Status → " + next);
    } catch { toast.error("Update failed"); }
  }

  return (
    <div className="space-y-4">
      {/* sticky subheader */}
      <div className="sticky top-3 z-10 glass border border-slate-200 rounded-2xl p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex gap-2">
            {chips.map(c => <Chip key={c} active={status===c} onClick={()=>setStatus(c)}>{c[0].toUpperCase()+c.slice(1)}</Chip>)}
          </div>
          <div className="md:ml-auto">
            <input className="rounded-lg border px-3 py-2 text-sm w-64" placeholder="Search title, amount, category…" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <Button className="md:ml-2" onClick={()=>setOpen(true)}>New request</Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Requests" subtitle="Track status and manage approvals" />
        <CardBody className="p-0">
          <div className="overflow-x-auto rounded-2xl">
            <T>
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <Th align="left">Title</Th>
                  <Th align="right">Amount</Th>
                  <Th align="center">Category</Th>
                  <Th align="center">Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({length:6}).map((_,i)=>(
                  <tr key={i} className="border-b border-slate-100">
                    <Td className="text-slate-300">████████</Td>
                    <Td align="right" className="text-slate-300">███</Td>
                    <Td align="center" className="text-slate-300">████</Td>
                    <Td align="center" className="text-slate-300">███</Td>
                    <Td className="text-slate-300">████</Td>
                  </tr>
                ))}
                {!loading && filtered.map(i => (
                  <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <Td><a className="text-blue-700 underline" href={"/requests/"+i.id}>{i.title}</a></Td>
                    <Td align="right">${Number(i.amount).toFixed(2)}</Td>
                    <Td align="center">{i.category_name || "—"}</Td>
                    <Td align="center"><Badge status={i.status} /></Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={()=>setStage(i.id,'approved')}>Approve</Button>
                        <Button variant="ghost" onClick={()=>setStage(i.id,'denied')}>Deny</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
                {!loading && !filtered.length && (
                  <tr><Td colSpan="5" className="text-slate-500">No matching requests — try clearing filters or create the first one.</Td></tr>
                )}
              </tbody>
            </T>
          </div>
        </CardBody>
      </Card>

      {/* mobile friendly FAB */}
      <FAB onClick={()=>setOpen(true)}>+</FAB>

      {/* slide-over intake */}
      <Drawer open={open} title="New purchase request" onClose={()=>setOpen(false)}
        footer={<Button onClick={create}>Create request</Button>}>
        <form onSubmit={create} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Title</label>
            <input className="w-full rounded-lg border px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="MacBook Pro 14&quot;" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Amount</label>
              <input className="w-full rounded-lg border px-3 py-2" value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="1299.99" required />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Category</label>
              <select className="w-full rounded-lg border px-3 py-2" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
                <option value="">(no category)</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Attach quote/receipt (optional)</label>
            <input className="w-full rounded-lg border px-3 py-2" type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          </div>
        </form>
      </Drawer>
    </div>
  );
}
