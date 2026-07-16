import { Landmark, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { InvoiceType } from "../../types";

export function TypeBadge({ t }: { t: InvoiceType }) {
  if (t==="izvod")  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-[11px] font-medium"><Landmark size={9}/>Izvod</span>;
  if (t==="hyrëse") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[11px] font-medium"><ArrowDownRight size={9}/>Hyrëse</span>;
  return                   <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[11px] font-medium"><ArrowUpRight size={9}/>Dalëse</span>;
}
