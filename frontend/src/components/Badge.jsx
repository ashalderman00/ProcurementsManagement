export default function Badge({status}) {
  const map = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-800",
    denied: "bg-red-100 text-red-700",
  };
  const label = (status||"").toString();
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[label]||"bg-slate-100 text-slate-700"}`}>{label||"—"}</span>;
}
