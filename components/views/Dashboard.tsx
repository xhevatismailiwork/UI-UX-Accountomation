import { TrendingUp, TrendingDown, Wallet, Receipt, Clock, AlertTriangle } from "lucide-react";
import { Invoice, Company } from "../../types";
import { Card, SectionHeader } from "../shared";
import { InvoiceTable } from "./InvoiceTable";
import { fmt } from "../../utils/format";
import { tvshThresholdAlert } from "../../utils/risk";

interface DashboardProps {
  company: Company;
  invoices: Invoice[];
  companies: Company[];
  onSelect: (inv: Invoice) => void;
}

export function Dashboard({ company, invoices, companies, onSelect }: DashboardProps) {
  const konfirmuara = invoices.filter(i => i.statusi === "konfirmuar" && i.lloji !== "izvod");
  const teArdhura = konfirmuara.filter(i => i.lloji === "dalëse").reduce((s, i) => s + i.shuma, 0);
  const shpenzime = konfirmuara.filter(i => i.lloji === "hyrëse").reduce((s, i) => s + i.shuma, 0);
  const fitimi = teArdhura - shpenzime;

  const tvshD = konfirmuara.filter(i => i.lloji === "dalëse").reduce((s, i) => s + i.tvsh, 0);
  const tvshH = konfirmuara.filter(i => i.lloji === "hyrëse").reduce((s, i) => s + i.tvsh, 0);
  const tvshPagese = tvshD - tvshH;

  const pending = invoices.filter(i => i.statusi === "pending");

  const alertCompanies = companies.filter(c => c.alert || tvshThresholdAlert(c));

  const kpis = [
    { label: "Të Ardhura (muaj)", value: fmt(teArdhura), Icon: TrendingUp, cls: "text-emerald-600 bg-emerald-50" },
    { label: "Shpenzime (muaj)", value: fmt(shpenzime), Icon: TrendingDown, cls: "text-red-600 bg-red-50" },
    { label: "Fitimi", value: fmt(fitimi), Icon: Wallet, cls: fitimi >= 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50" },
    { label: "TVSH për Pagesë", value: fmt(tvshPagese), Icon: Receipt, cls: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-slate-400 font-medium">{k.label}</p>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${k.cls}`}><k.Icon size={14} /></div>
            </div>
            <p className="text-lg font-bold text-slate-800 font-mono">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <InvoiceTable
            title="Faturat Pending"
            sub={`${pending.length} fatura presin rishikim nga kontabilisti`}
            invoices={pending}
            onSelect={onSelect}
            emptyLabel="Nuk ka fatura pending — gjithçka është konfirmuar"
          />
        </div>
        <div className="space-y-5">
          <Card>
            <SectionHeader title="Alerte & Njoftime" sub={`${alertCompanies.length} kompani me alert aktiv`} />
            <div className="p-3 space-y-2 max-h-[340px] overflow-y-auto">
              {alertCompanies.length === 0 && (
                <p className="text-xs text-slate-400 px-1 py-4 text-center">Nuk ka alerte aktive</p>
              )}
              {alertCompanies.map(c => {
                const threshold = tvshThresholdAlert(c);
                return (
                  <div key={c.id} className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertTriangle size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-800 truncate">{c.ikona} {c.emri}</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        {c.alertTip ?? (threshold ? `Qarkullimi ${threshold.pct}% i pragut TVSH` : "")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} className="text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">Faturat e Vonuara</p>
            </div>
            <p className="text-2xl font-bold text-red-600 font-mono">{invoices.filter(i => i.statusi === "vonuar").length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Kompania aktive: {company.emri}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
