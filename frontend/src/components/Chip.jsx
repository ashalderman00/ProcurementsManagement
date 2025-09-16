export default function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-sm border transition " +
        (active ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50")
      }>
      {children}
    </button>
  );
}
