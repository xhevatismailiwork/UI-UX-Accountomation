import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { Company, Role, TVSHType } from "../../types";
import { Card, TVSHBadge } from "../shared";
import { fmt } from "../../utils/format";
import { TODAY } from "../../utils/format";
import { tvshThresholdAlert } from "../../utils/risk";
import { canManageCompanies } from "../../utils/permissions";

interface KompaniteProps {
  role: Role;
  companies: Company[];
  activeCompanyId: string;
  onSelectCompany: (id: string) => void;
  onChangeTvsh: (numriKompanise: string, tvshTipi: TVSHType) => void;
  onAddCompany: (c: Company) => void;
  onEditCompany: (numriKompanise: string, changes: Partial<Company>) => void;
  onDeleteCompany: (numriKompanise: string) => void;
}

const TVSH_OPTIONS: { value: TVSHType; label: string }[] = [
  { value: "pa_tvsh", label: "Pa TVSH" },
  { value: "tvsh_tremujore", label: "TVSH Tremujore" },
  { value: "tvsh_mujore", label: "TVSH Mujore" },
];

const tvshLabel = (t: TVSHType) => TVSH_OPTIONS.find(o => o.value === t)?.label ?? t;
const PER_PAGE = 8;

interface PendingChange { companyId: string; companyName: string; from: TVSHType; to: TVSHType }

type CompanyDraft = { emri: string; numriKompanise: string; sektori: string; qarkullimi: number | ""; ikona: string; tvshTipi: TVSHType };
const BLANK_DRAFT: CompanyDraft = { emri: "", numriKompanise: "", sektori: "", qarkullimi: "", ikona: "🏢", tvshTipi: "pa_tvsh" };

function CompanyForm({ initial, onSave, onCancel }: { initial?: CompanyDraft; onSave: (v: CompanyDraft) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<CompanyDraft>(initial ?? BLANK_DRAFT);
  const valid = draft.emri.trim().length > 0 && draft.numriKompanise.trim().length > 0 && draft.sektori.trim().length > 0 && draft.qarkullimi !== "" && Number(draft.qarkullimi) > 0;

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] text-slate-400 font-medium">Ikona (emoji)</label>
          <input value={draft.ikona} onChange={e => setDraft(d => ({ ...d, ikona: e.target.value }))}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-slate-400 font-medium">Emri Ligjor</label>
          <input value={draft.emri} onChange={e => setDraft(d => ({ ...d, emri: e.target.value }))} placeholder="p.sh. Delta Trade DOOEL"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 font-medium">Nr. Kompanisë (EMBS)</label>
          <input value={draft.numriKompanise} onChange={e => setDraft(d => ({ ...d, numriKompanise: e.target.value }))} placeholder="7000001"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-slate-400 font-medium">Sektori</label>
          <input value={draft.sektori} onChange={e => setDraft(d => ({ ...d, sektori: e.target.value }))} placeholder="p.sh. Tregti"
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 font-medium">Qarkullimi Vjetor (MKD)</label>
          <input type="number" value={draft.qarkullimi} onChange={e => setDraft(d => ({ ...d, qarkullimi: e.target.value === "" ? "" : Number(e.target.value) }))}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 font-medium">Statusi TVSH</label>
          <select value={draft.tvshTipi} onChange={e => setDraft(d => ({ ...d, tvshTipi: e.target.value as TVSHType }))}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white">
            {TVSH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={!valid} onClick={() => valid && onSave(draft)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <Plus size={12} />Ruaj Kompaninë
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Anulo</button>
      </div>
    </div>
  );
}

export function Kompanite({ role, companies, activeCompanyId, onSelectCompany, onChangeTvsh, onAddCompany, onEditCompany, onDeleteCompany }: KompaniteProps) {
  const canManage = canManageCompanies(role);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(companies.length / PER_PAGE));
  useEffect(() => { setPage(1); }, [companies.length]);
  const pageCompanies = companies.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Card>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Kompanitë</h3>
          <p className="text-xs text-slate-400 mt-0.5">{companies.length} kompani regjistruara në sistem</p>
        </div>
        {canManage && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-md hover:bg-[#0f2647] transition-colors">
            <Plus size={12} />Regjistro Kompani
          </button>
        )}
      </div>

      {adding && (
        <div className="p-3">
          <CompanyForm
            onCancel={() => setAdding(false)}
            onSave={v => {
              onAddCompany({
                id: `c-${Date.now()}`, emri: v.emri, numriKompanise: v.numriKompanise, sektori: v.sektori,
                qarkullimi: Number(v.qarkullimi), ikona: v.ikona || "🏢", tvshTipi: v.tvshTipi,
                faturaFundit: TODAY.toISOString().slice(0, 10), alert: false,
              });
              setAdding(false);
            }}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="text-left font-medium px-4 py-2.5">Kompania</th>
              <th className="text-left font-medium px-4 py-2.5">Nr. Kompanisë (EMBS)</th>
              <th className="text-left font-medium px-4 py-2.5">Sektori</th>
              <th className="text-left font-medium px-4 py-2.5">Statusi TVSH</th>
              <th className="text-right font-medium px-4 py-2.5">Qarkullimi Vjetor</th>
              <th className="text-left font-medium px-4 py-2.5">Fatura e Fundit</th>
              <th className="text-left font-medium px-4 py-2.5">Alert</th>
              {canManage && <th className="px-4 py-2.5"></th>}
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pageCompanies.map(c =>
              editingId === c.numriKompanise ? (
                <tr key={c.id}>
                  <td colSpan={canManage ? 9 : 8} className="p-2">
                    <CompanyForm
                      initial={{ emri: c.emri, numriKompanise: c.numriKompanise, sektori: c.sektori, qarkullimi: c.qarkullimi, ikona: c.ikona, tvshTipi: c.tvshTipi }}
                      onCancel={() => setEditingId(null)}
                      onSave={v => {
                        onEditCompany(c.numriKompanise, { emri: v.emri, sektori: v.sektori, qarkullimi: Number(v.qarkullimi), ikona: v.ikona, tvshTipi: v.tvshTipi });
                        setEditingId(null);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                (() => {
                  const threshold = tvshThresholdAlert(c);
                  return (
                    <tr key={c.id}
                      className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${activeCompanyId === c.numriKompanise ? "bg-blue-50/50" : ""}`}>
                      <td className="px-4 py-2.5 font-semibold text-slate-700 cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}>{c.ikona} {c.emri}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}>{c.numriKompanise}</td>
                      <td className="px-4 py-2.5 text-slate-500 cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}>{c.sektori}</td>
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        {canManage ? (
                          <select value={c.tvshTipi}
                            onChange={e => {
                              const to = e.target.value as TVSHType;
                              if (to !== c.tvshTipi) setPending({ companyId: c.numriKompanise, companyName: c.emri, from: c.tvshTipi, to });
                            }}
                            className="text-[11px] font-medium border border-slate-200 rounded px-1.5 py-1 outline-none cursor-pointer hover:border-blue-300 bg-white">
                            {TVSH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        ) : (
                          <TVSHBadge t={c.tvshTipi} />
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-700 cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}>{fmt(c.qarkullimi)}</td>
                      <td className="px-4 py-2.5 text-slate-500 cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}>{c.faturaFundit}</td>
                      <td className="px-4 py-2.5 cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}>
                        {(c.alert || threshold) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            <AlertTriangle size={10} />{c.alertTip ?? `Prag ${threshold?.pct}%`}
                          </span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditingId(c.numriKompanise)} className="p-1 text-blue-500 hover:text-blue-700"><Pencil size={12} /></button>
                            <button onClick={() => setDeleteTarget(c)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right cursor-pointer" onClick={() => onSelectCompany(c.numriKompanise)}><ArrowRight size={13} className="text-slate-300" /></td>
                    </tr>
                  );
                })()
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Faqja {page} nga {totalPages} · {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, companies.length)} nga {companies.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={12} />Mbrapa
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors ${n === page ? "bg-[#1B3A6B] text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Para<ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="w-[380px] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">A dëshironi ta ndryshoni TVSH-në e kompanisë?</p>
                <p className="text-xs text-slate-500 mt-1.5">
                  <span className="font-semibold">{pending.companyName}</span>: nga <span className="font-medium">{tvshLabel(pending.from)}</span> në <span className="font-medium">{tvshLabel(pending.to)}</span>.
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5">Ky ndryshim ndikon llogaritjen e TVSH-së dhe deklaratat e ardhshme.</p>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button onClick={() => setPending(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">Anulo</button>
              <button
                onClick={() => { onChangeTvsh(pending.companyId, pending.to); setPending(null); }}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-bold rounded-md hover:bg-[#0f2647] transition-colors">
                Po, Ndrysho
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <div className="w-[380px] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <Trash2 size={14} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">A dëshironi ta fshini këtë kompani?</p>
                <p className="text-xs text-slate-500 mt-1.5">
                  <span className="font-semibold">{deleteTarget.emri}</span> ({deleteTarget.numriKompanise}) do të hiqet nga sistemi bashkë me qasjen e saj.
                </p>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="p-1 text-slate-400 hover:text-slate-600 ml-auto"><X size={14} /></button>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">Anulo</button>
              <button
                onClick={() => { onDeleteCompany(deleteTarget.numriKompanise); setDeleteTarget(null); }}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-colors">
                Po, Fshije
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
