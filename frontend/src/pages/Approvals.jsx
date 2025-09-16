import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../components/Card";
import { T, Th, Td } from "../components/Table";  // ✅ shared
import Button from "../components/Button";
import Modal from "../components/modal";
import { useToast } from "../components/toast";

export default function Approvals() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState({ open:false, id:null, next:null });

  async function load() {
    try {
      setErr("");
      const res = await fetch("/api/requests");
      const data = await res.json();
      setItems(data.filter(i => i.status === "pending"));
    } catch (e) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function doStatus(id, status) {
    try {
      const res = await fetch("/api/requests/" + id, {
        method:"PATCH", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed: " + res.status);
      setItems(items.filter(i => i.id !== id));
      toast.success("Status updated");
    } catch (e) { toast.error("Update failed"); }
  }

  return (
    <Card>
      <CardHeader title="Approvals" subtitle="Review and act on pending requests" />
      <CardBody className="p-0">
        {err && <p className="text-red-600 p-4">Error: {err}</p>}
        <div className="overflow-x-auto rounded-2xl">
          <T>
            <thead className="bg-slate-50">
              <tr>
                <Th align="left">Title</Th>
                <Th align="right">Amount</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-b">
                  <Td>{i.title}</Td>
                  <Td align="right">${Number(i.amount).toFixed(2)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={()=>setConfirm({ open:true, id:i.id, next:"approved" })}>Approve</Button>
                      <Button variant="ghost" onClick={()=>setConfirm({ open:true, id:i.id, next:"denied" })}>Deny</Button>
                    </div>
                  </Td>
                </tr>
              ))}
              {!items.length && <tr><Td colSpan="3" className="text-slate-500">No pending approvals.</Td></tr>}
            </tbody>
          </T>
        </div>
      </CardBody>

      <Modal
        open={confirm.open}
        title={"Confirm " + (confirm.next||"")}
        onCancel={()=>setConfirm({ open:false, id:null, next:null })}
        onConfirm={() => { doStatus(confirm.id, confirm.next); setConfirm({ open:false, id:null, next:null }); }}
      >
        Are you sure you want to set this request to <b>{confirm.next}</b>?
      </Modal>
    </Card>
  );
}
