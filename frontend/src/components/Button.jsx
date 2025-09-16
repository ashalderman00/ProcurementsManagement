export default function Button({ variant="primary", className="", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50",
    ghost: "border border-slate-300 text-slate-800 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  }[variant] || "";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
