import { useEffect } from "react";

export default function Modal({ open, title="Confirm", children, onCancel, onConfirm, confirmText="Confirm" }) {
  useEffect(() => {
    function onKey(e){ if(!open) return; if(e.key==="Escape") onCancel?.(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-lg">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold">{title}</div>
        <div className="px-5 py-4 text-sm text-slate-700">{children}</div>
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
