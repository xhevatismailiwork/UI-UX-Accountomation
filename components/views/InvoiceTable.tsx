import { FileX2 } from "lucide-react";
import { Invoice } from "../../types";
import { Card, SectionHeader, StatusBadge, TypeBadge, OCRBar } from "../shared";
import { fmt, daysDiff } from "../../utils/format";

interface InvoiceTableProps {
  title: string;
  sub?: string;
  invoices: Invoice[];
  onSelect: (inv: Invoice) => void;
  emptyLabel?: string;
}

export function InvoiceTable({ title, sub, invoices, onSelect, emptyLabel }: InvoiceTableProps) {
  return (
    <Card>
      <SectionHeader title={title} sub={sub} />
      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400">
          <FileX2 size={28} className="mb-2" />
          <p className="text-xs">{emptyLabel ?? "Asnjë faturë"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left font-medium px-4 py-2.5">Nr. Faturës</th>
                <th className="text-left font-medium px-4 py-2.5">Data</th>
                <th className="text-left font-medium px-4 py-2.5">Lloji</th>
                <th className="text-right font-medium px-4 py-2.5">Shuma</th>
                <th className="text-left font-medium px-4 py-2.5">Statusi</th>
                <th className="text-left font-medium px-4 py-2.5">OCR</th>
                <th className="text-left font-medium px-4 py-2.5">Afati</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const dite = inv.afatiPageses !== "-" ? daysDiff(inv.afatiPageses) : null;
                return (
                  <tr key={inv.id} onClick={() => onSelect(inv)}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{inv.nrFatura}</td>
                    <td className="px-4 py-2.5 text-slate-500">{inv.data}</td>
                    <td className="px-4 py-2.5"><TypeBadge t={inv.lloji} /></td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">{fmt(inv.shuma)}</td>
                    <td className="px-4 py-2.5"><StatusBadge s={inv.statusi} /></td>
                    <td className="px-4 py-2.5"><OCRBar v={inv.ocr} /></td>
                    <td className="px-4 py-2.5">
                      {inv.afatiPageses === "-" ? (
                        <span className="text-slate-300">—</span>
                      ) : dite !== null && dite < 0 ? (
                        <span className="text-red-600 font-semibold">{Math.abs(dite)}d vonuar</span>
                      ) : dite !== null && dite <= 3 ? (
                        <span className="text-orange-600 font-semibold">{dite}d mbeten</span>
                      ) : (
                        <span className="text-slate-500">{inv.afatiPageses}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
