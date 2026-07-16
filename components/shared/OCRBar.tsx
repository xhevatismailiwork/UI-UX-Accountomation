export function OCRBar({ v }: { v: number }) {
  const color = v>=90 ? "bg-emerald-500" : v>=75 ? "bg-amber-400" : "bg-red-400";
  const text  = v>=90 ? "text-emerald-700" : v>=75 ? "text-amber-700" : "text-red-600";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color}`} style={{ width:`${v}%` }}/>
      </div>
      <span className={`text-[11px] font-mono font-semibold ${text}`}>{v}%</span>
      {v>=90 && <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">AUTO</span>}
    </div>
  );
}
