import { CheckCircle, Clock, XCircle, Copy, AlertTriangle } from "lucide-react";
import { InvoiceStatus } from "../../types";

export function StatusBadge({ s }: { s: InvoiceStatus }) {
  const map: Record<InvoiceStatus,{label:string;cls:string;Icon:any}> = {
    konfirmuar: { label:"Konfirmuar", cls:"bg-emerald-50 text-emerald-700 border-emerald-200", Icon:CheckCircle },
    pending:    { label:"Pending",    cls:"bg-amber-50 text-amber-700 border-amber-200",       Icon:Clock },
    refuzuar:   { label:"Refuzuar",   cls:"bg-red-50 text-red-700 border-red-200",             Icon:XCircle },
    duplikat:   { label:"Duplikat",   cls:"bg-purple-50 text-purple-700 border-purple-200",    Icon:Copy },
    vonuar:     { label:"Vonuar",     cls:"bg-red-100 text-red-800 border-red-300",            Icon:AlertTriangle },
  };
  const { label, cls, Icon } = map[s];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${cls}`}>
      <Icon size={10}/>{label}
    </span>
  );
}
