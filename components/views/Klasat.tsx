import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CompanyData } from "../../data/companyData";
import { Card, SectionHeader } from "../shared";
import { fmt } from "../../utils/format";

export function Klasat({ data }: { data: CompanyData }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [openNk, setOpenNk] = useState<Record<string, boolean>>({});

  return (
    <Card>
      <SectionHeader title="Klasat & Nënklasat Kontabël" sub="Sistemi zyrtar i klasave 0–9 (Pravilnik UJP) — klasa → grupa → llogaria" />
      <div className="divide-y divide-slate-50">
        {data.klasat.map(k => {
          const isOpen = !!open[k.k];
          return (
            <div key={k.k}>
              <button onClick={() => setOpen(o => ({ ...o, [k.k]: !o[k.k] }))}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-2.5">
                  {isOpen ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white text-[11px] font-bold rounded">{k.k}</span>
                  <span className="text-xs font-semibold text-slate-700">{k.emri}</span>
                  <span className="text-[10px] text-slate-400">({k.nr} fatura)</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">D: {fmt(k.debit)}</span>
                  <span className="text-slate-400">K: {fmt(k.kredit)}</span>
                  <span className={`font-bold w-28 text-right ${k.gjendje >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmt(k.gjendje)}</span>
                </div>
              </button>
              {isOpen && (
                <div className="pb-2">
                  {k.nenklasat.map(nk => {
                    const nkKey = `${k.k}.${nk.nk}`;
                    const nkOpen = !!openNk[nkKey];
                    const hasAccounts = nk.llogarite.length > 0;
                    return (
                      <div key={nk.nk}>
                        <button
                          onClick={() => hasAccounts && setOpenNk(o => ({ ...o, [nkKey]: !o[nkKey] }))}
                          className={`w-full flex items-center justify-between px-4 py-2 pl-10 text-[11px] hover:bg-slate-50 transition-colors text-left ${!hasAccounts ? "cursor-default" : ""}`}>
                          <div className="flex items-center gap-2">
                            {hasAccounts ? (
                              nkOpen ? <ChevronDown size={11} className="text-slate-300" /> : <ChevronRight size={11} className="text-slate-300" />
                            ) : <span className="w-[11px]" />}
                            <span className="font-mono text-slate-400">{nk.nk}</span>
                            <span className="text-slate-600">{nk.emri}</span>
                            <span className="text-[10px] text-slate-400">({nk.nr})</span>
                          </div>
                          <div className="flex items-center gap-4 font-mono">
                            <span className="text-slate-400">D: {fmt(nk.debit)}</span>
                            <span className="text-slate-400">K: {fmt(nk.kredit)}</span>
                            <span className={`font-semibold w-28 text-right ${nk.gjendje >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmt(nk.gjendje)}</span>
                          </div>
                        </button>
                        {nkOpen && (
                          <div className="pb-1">
                            {nk.llogarite.map(l => (
                              <div key={l.kod} className="flex items-center justify-between px-4 py-1.5 pl-16 text-[10px] hover:bg-slate-50">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-slate-400">{l.kod}</span>
                                  <span className="text-slate-500">{l.emri}</span>
                                  {l.nr > 0 && <span className="text-[9px] text-slate-300">({l.nr})</span>}
                                </div>
                                <div className="flex items-center gap-4 font-mono">
                                  <span className="text-slate-300">D: {fmt(l.debit)}</span>
                                  <span className="text-slate-300">K: {fmt(l.kredit)}</span>
                                  <span className={`font-medium w-24 text-right ${l.gjendje >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmt(l.gjendje)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
