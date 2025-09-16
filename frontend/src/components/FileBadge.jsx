export default function FileBadge({ name, href }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
       className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">
      <span className="i-file" /> {name}
    </a>
  );
}
