import { CompanyData } from "../../data/companyData";
import { Card, SectionHeader } from "../shared";
import { fmt } from "../../utils/format";

export function Bilanci({ data }: { data: CompanyData }) {
  const byClass = (ks: string[]) => data.klasat.filter(k => ks.includes(k.k));
  const aktiva = byClass(["0", "1", "3", "6"]);
  const kapitali = byClass(["9"]);
  const detyrimet = byClass(["2"]);

  const sum = (rows: { gjendje: number }[]) => rows.reduce((s, r) => s + Math.abs(r.gjendje), 0);
  const totAktiva = sum(aktiva);
  const totKapitali = sum(kapitali);
  const totDetyrime = sum(detyrimet);
  const totPasiva = totKapitali + totDetyrime;

  const Column = ({ title, rows, total, cls }: { title: string; rows: typeof aktiva; total: number; cls: string }) => (
    <Card>
      <SectionHeader title={title} />
      <div className="divide-y divide-slate-50">
        {rows.map(r => (
          <div key={r.k} className="flex justify-between px-4 py-2.5 text-xs">
            <span className="text-slate-600">{r.k}. {r.emri}</span>
            <span className="font-mono font-semibold text-slate-700">{fmt(Math.abs(r.gjendje))}</span>
          </div>
        ))}
        <div className={`flex justify-between px-4 py-3 font-bold text-xs ${cls}`}>
          <span>TOTALI</span>
          <span className="font-mono">{fmt(total)}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <Column title="AKTIVA (Klasa 0, 1, 3, 6)" rows={aktiva} total={totAktiva} cls="bg-blue-50 text-blue-800" />
        <div className="space-y-5">
          <Column title="KAPITALI (Klasa 9)" rows={kapitali} total={totKapitali} cls="bg-indigo-50 text-indigo-800" />
          <Column title="DETYRIMET (Klasa 2)" rows={detyrimet} total={totDetyrime} cls="bg-slate-100 text-slate-800" />
        </div>
      </div>
      <Card className={`p-4 flex items-center justify-between ${totAktiva === totPasiva ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
        <p className="text-xs font-semibold text-slate-700">Bilanci (Aktiva = Pasiva)</p>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span>Aktiva: {fmt(totAktiva)}</span>
          <span>=</span>
          <span>Pasiva: {fmt(totPasiva)}</span>
          <span className={`font-bold ${totAktiva === totPasiva ? "text-emerald-700" : "text-red-600"}`}>
            {totAktiva === totPasiva ? "✓ Barazuar" : "✗ Jo-Barazuar"}
          </span>
        </div>
      </Card>
    </div>
  );
}
