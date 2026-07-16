export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-4 py-3 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
