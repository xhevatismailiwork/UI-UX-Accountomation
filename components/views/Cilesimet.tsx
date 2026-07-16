import { Building2, Percent, Bell, Users } from "lucide-react";
import { Company } from "../../types";
import { Card, SectionHeader, TVSHBadge } from "../shared";
import { fmtNum } from "../../utils/format";

export function Cilesimet({ company }: { company: Company }) {
  const rows = [
    { label: "Emri Ligjor", value: company.emri, Icon: Building2 },
    { label: "Nr. Kompanisë (EMBS)", value: company.numriKompanise, Icon: Building2 },
    { label: "Sektori", value: company.sektori, Icon: Building2 },
  ];

  return (
    <div className="space-y-5">
      <Card>
        <SectionHeader title="Të Dhënat e Kompanisë" />
        <div className="grid grid-cols-3 gap-3 p-4">
          {rows.map(r => (
            <div key={r.label} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <r.Icon size={11} className="text-slate-400" />
                <p className="text-[10px] text-slate-400 font-medium">{r.label}</p>
              </div>
              <p className="text-xs font-semibold text-slate-700">{r.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Konfigurimi i TVSH-së" sub="Ndryshimi i tipit kërkon konfirmim nga kontabilisti" />
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Percent size={15} className="text-slate-400" />
            <div>
              <p className="text-xs font-semibold text-slate-700">Kategoria Aktuale</p>
              <p className="text-[10px] text-slate-400">Sipas qarkullimit vjetor: {fmtNum(company.qarkullimi)} MKD</p>
            </div>
          </div>
          <TVSHBadge t={company.tvshTipi} />
        </div>
      </Card>

      <Card>
        <SectionHeader title="Njoftimet" />
        <div className="p-4 space-y-2.5">
          {[
            "Njoftim 7 ditë para afatit të pagesës",
            "Njoftim 3 ditë para afatit të pagesës",
            "Alert kur kompania s'ka fatura 30 ditë",
            "Alert kur qarkullimi kalon pragun TVSH",
          ].map(l => (
            <div key={l} className="flex items-center gap-2.5">
              <Bell size={12} className="text-blue-400 flex-shrink-0" />
              <span className="text-xs text-slate-600">{l}</span>
              <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">Aktiv</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Përdoruesit & Rolet" />
        <div className="p-4 space-y-2.5">
          {[
            { emri: "Ana Petrovska", roli: "Administrator (Kontabiliste)" },
            { emri: "Marko Nikolovski", roli: "Operator (Pronar)" },
          ].map(u => (
            <div key={u.emri} className="flex items-center gap-2.5">
              <Users size={12} className="text-slate-400 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-700">{u.emri}</span>
              <span className="ml-auto text-[10px] text-slate-500">{u.roli}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
