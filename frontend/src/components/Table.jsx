export function T({children}) {
  return <table className="min-w-full text-sm">{children}</table>;
}
export function Th({children, align="left"}) {
  const a = align==="right"?"text-right":align==="center"?"text-center":"text-left";
  return <th className={`px-3 py-2 font-medium text-slate-600 ${a} sticky top-0 bg-slate-50`}>{children}</th>;
}
export function Td({children, align="left", className="", ...rest}) {
  const a = align==="right"?"text-right":align==="center"?"text-center":"text-left";
  return <td className={`px-3 py-2 ${a} ${className}`} {...rest}>{children}</td>;
}
