import { TVSHType } from "../../types";

export function TVSHBadge({ t }: { t: TVSHType }) {
  const map: Record<TVSHType,{label:string;cls:string}> = {
    pa_tvsh:        { label:"Pa TVSH",       cls:"bg-slate-100 text-slate-600 border-slate-200" },
    tvsh_tremujore: { label:"TVSH Tremujore", cls:"bg-blue-50 text-blue-700 border-blue-200" },
    tvsh_mujore:    { label:"TVSH Mujore",   cls:"bg-indigo-50 text-indigo-700 border-indigo-200" },
  };
  const { label, cls } = map[t];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cls}`}>{label}</span>;
}
