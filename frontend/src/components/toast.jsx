import { createContext, useContext, useState, useCallback, useEffect } from "react";
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="default") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  const value = {
    show: add,
    success: (m)=>add(m,"success"),
    error: (m)=>add(m,"error"),
    info: (m)=>add(m,"info"),
  };
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-3 right-3 z-[9999] space-y-2">
        {toasts.map(t => (
          <div key={t.id}
               className={
                 "rounded-xl border px-3 py-2 shadow-sm text-sm bg-white " +
                 (t.type==="success" ? "border-green-300 text-green-800" :
                  t.type==="error" ? "border-red-300 text-red-800" :
                  t.type==="info" ? "border-blue-300 text-blue-800" : "border-slate-200 text-slate-800")
               }>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast(){ return useContext(ToastCtx); }
