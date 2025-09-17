export default function SkeletonRow({ cols=4 }){
  const blocks = Array.from({length: cols});
  return (
    <tr className="border-b border-slate-100">
      {blocks.map((_,i)=>(
        <td key={i} className="px-3 py-2">
          <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}
