export function Tabs({ tabs, current, onChange }) {
  return (
    <div className="flex gap-2 border-b border-slate-200">
      {tabs.map(t => (
        <button key={t}
          onClick={()=>onChange(t)}
          className={
            "px-3 py-2 text-sm border-b-2 -mb-px " +
            (current===t ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-600 hover:text-slate-900")
          }>
          {t}
        </button>
      ))}
    </div>
  );
}
