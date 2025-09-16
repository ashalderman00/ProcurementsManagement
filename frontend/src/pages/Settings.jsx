import { useState } from "react";
import RuleEditor from "./RuleEditor";
import Button from "../components/Button";

export default function Settings() {
  const [open,setOpen]=useState(false);
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Settings</h2>
      <p className="text-slate-600">Manage approval policies, categories, and vendors.</p>
      <Button onClick={()=>setOpen(true)}>New approval rule</Button>
      <RuleEditor open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
