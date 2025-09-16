import { useEffect, useState } from "react";
import RequestDetailDrawer from "./RequestDetail";

export default function RequestDetailRoute(){
  const [open,setOpen]=useState(true);
  useEffect(()=>{ setOpen(true); }, []);
  return <RequestDetailDrawer open={open} onClose={()=>history.back()} />;
}
