import { useState } from "react";
import { CheckCircle2, Circle, FileCheck, Send } from "lucide-react";
import { Company, Invoice, Role } from "../../types";
import { Card, SectionHeader, TVSHBadge } from "../shared";
import { canEditInvoices } from "../../utils/permissions";
import { fmt } from "../../utils/format";

export function Raportet({ company, invoices, role }: { company: Company; invoices: Invoice[]; role: Role }) {
  const [confirmed, setConfirmed] = useState(false);

  const konfirmuara = invoices.filter(i => i.statusi === "konfirmuar" && i.lloji !== "izvod");
  const tvshD = konfirmuara.filter(i => i.lloji === "dalëse").reduce((s, i) => s + i.tvsh, 0);
  const tvshH = konfirmuara.filter(i => i.lloji === "hyrëse").reduce((s, i) => s + i.tvsh, 0);
  const tvshPagese = tvshD - tvshH;

  const pending = invoices.filter(i => i.statusi === "pending");
  const duplikate = invoices.filter(i => i.statusi === "duplikat");
  const isPaTvsh = company.tvshTipi === "pa_tvsh";

  const readinessChecks = [
    { label: "Të gjitha faturat hyrëse janë procesuar", ok: pending.filter(i => i.lloji === "hyrëse").length === 0 },
    { label: "Të gjitha faturat dalëse janë procesuar", ok: pending.filter(i => i.lloji === "dalëse").length === 0 },
    { label: "Faturat pending janë rishikuar", ok: pending.length === 0 },
    { label: "Faturat e dyfishta janë kontrolluar", ok: duplikate.length === 0 },
    { label: "TVSH-D dhe TVSH-H janë llogaritur", ok: true },
  ];
  const ready = readinessChecks.every(c => c.ok);

  return (
    <div className="space-y-5">
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-slate-700">{company.emri}</p>
          <TVSHBadge t={company.tvshTipi} />
        </div>
        <p className="text-[11px] text-slate-400">Tremujori Q2 2025 (Prill – Qershor)</p>
      </Card>

      {isPaTvsh ? (
        <Card className="p-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Kjo kompani nuk është e regjistruar në TVSH. TVSH-ja e faturave hyrëse nuk zbritet — regjistrohet
            direkt si kosto e biznesit. Nuk ka deklaratë TVSH për t'u dorëzuar.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="text-[10px] text-slate-400 font-medium mb-1">TVSH e paguar (si kosto)</p>
              <p className="text-sm font-mono font-bold text-slate-700">{fmt(tvshH)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="text-[10px] text-slate-400 font-medium mb-1">Qarkullimi Vjetor</p>
              <p className="text-sm font-mono font-bold text-slate-700">{fmt(company.qarkullimi)}</p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-[10px] text-slate-400 font-medium mb-1">TVSH Dalëse (TVSH-D)</p>
              <p className="text-lg font-mono font-bold text-emerald-600">{fmt(tvshD)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[10px] text-slate-400 font-medium mb-1">TVSH Hyrëse (TVSH-H)</p>
              <p className="text-lg font-mono font-bold text-red-500">{fmt(tvshH)}</p>
            </Card>
            <Card className="p-4 bg-slate-800 border-slate-800">
              <p className="text-[10px] text-blue-200 font-medium mb-1">TVSH Për Pagesë</p>
              <p className="text-lg font-mono font-bold text-white">{fmt(tvshPagese)}</p>
            </Card>
          </div>

          <Card>
            <SectionHeader title="Kontrolli i Gatishmërisë për Deklarim" sub="Kërkohet para se deklarata të shënohet gati për dorëzim" />
            <div className="p-3 space-y-1.5">
              {readinessChecks.map(c => (
                <div key={c.label} className="flex items-center gap-2 px-2 py-1.5">
                  {c.ok ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" /> : <Circle size={14} className="text-amber-400 flex-shrink-0" />}
                  <span className={`text-xs ${c.ok ? "text-slate-600" : "text-amber-700 font-medium"}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck size={15} className={ready ? "text-emerald-600" : "text-slate-300"} />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Statusi: {confirmed ? "Konfirmuar Manualisht" : ready ? "Gati për Dorëzim" : "Në Përpunim"}
                </p>
                <p className="text-[10px] text-slate-400">Dorëzim tek Uprava za Javni Prihodi (DAP)</p>
              </div>
            </div>
            {canEditInvoices(role) && !confirmed && (
              <button disabled={!ready} onClick={() => setConfirmed(true)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors
                  ${ready ? "bg-[#1B3A6B] text-white hover:bg-[#0f2647]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                <Send size={12} />Konfirmo Dorëzimin
              </button>
            )}
            {confirmed && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded font-semibold">
                ✓ Dorëzuar më 25 Qershor 2025
              </span>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
