import { CompanyData } from "../../data/companyData";
import { Card, SectionHeader } from "../shared";
import { fmt } from "../../utils/format";

function GroupTable({ title, rows, total }: { title: string; rows: { zeri: string; shuma: number; tip: "hyrje" | "dalje" }[]; total: number }) {
  return (
    <Card>
      <SectionHeader title={title} />
      <div className="divide-y divide-slate-50">
        {rows.map(r => (
          <div key={r.zeri} className="flex justify-between items-center px-4 py-2.5 text-xs">
            <span className="text-slate-600">{r.zeri}</span>
            <span className={`font-mono font-semibold ${r.tip === "hyrje" ? "text-emerald-600" : "text-red-500"}`}>
              {r.tip === "hyrje" ? "+" : ""}{fmt(r.shuma)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 font-bold text-xs">
          <span className="text-slate-700">Neto</span>
          <span className={`font-mono ${total >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmt(total)}</span>
        </div>
      </div>
    </Card>
  );
}

export function CashFlow({ data }: { data: CompanyData }) {
  const sum = (rows: { shuma: number }[]) => rows.reduce((s, r) => s + r.shuma, 0);
  const totOp = sum(data.cfOperative), totInv = sum(data.cfInvestuese), totFin = sum(data.cfFinanciare);

  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader title="Rrjedha e Parasë Ditore" sub="Qershor 2025" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left font-medium px-4 py-2.5">Data</th>
                <th className="text-right font-medium px-4 py-2.5">Hyrje</th>
                <th className="text-right font-medium px-4 py-2.5">Dalje</th>
                <th className="text-right font-medium px-4 py-2.5">Neto</th>
              </tr>
            </thead>
            <tbody>
              {data.cashflow.map(r => (
                <tr key={r.data} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-600">{r.data}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600">+{fmt(r.hyrje)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-red-500">-{fmt(r.dalje)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-semibold ${r.neto >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmt(r.neto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-5">
        <GroupTable title="Aktiviteti Operativ" rows={data.cfOperative} total={totOp} />
        <GroupTable title="Aktiviteti Investues" rows={data.cfInvestuese} total={totInv} />
        <GroupTable title="Aktiviteti Financiar" rows={data.cfFinanciare} total={totFin} />
      </div>
    </div>
  );
}
