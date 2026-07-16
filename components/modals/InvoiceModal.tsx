import { useState } from "react";
import { X, Info, Bell, Edit2, Copy, Check, Calendar, Clock, Hash, Building2, Save, Trash2 } from "lucide-react";
import { Invoice, InvoiceType, Role } from "../../types";
import { riskLabel } from "../../utils/risk";
import { canEditInvoices } from "../../utils/permissions";
import { daysDiff, fmt } from "../../utils/format";
import { StatusBadge } from "../shared/StatusBadge";
import { TypeBadge } from "../shared/TypeBadge";
import { OCRBar } from "../shared/OCRBar";
import { InvoiceDocumentPreview } from "../shared/InvoiceDocumentPreview";

type Draft = {
  nrFatura: string; data: string; shuma: number; tvsh: number;
  lloji: InvoiceType; afatiPageses: string; pershkrim: string;
  numriKompanise: string; sektori: string;
};

const toDraft = (inv: Invoice): Draft => ({
  nrFatura: inv.nrFatura, data: inv.data, shuma: inv.shuma, tvsh: inv.tvsh,
  lloji: inv.lloji, afatiPageses: inv.afatiPageses, pershkrim: inv.pershkrim ?? "",
  numriKompanise: inv.numriKompanise, sektori: inv.sektori ?? "",
});

export function InvoiceModal({ inv, role, onClose, onConfirm, onSave, onDelete }: {
  inv: Invoice; role: Role; onClose: () => void; onConfirm: (id:string) => void;
  onSave?: (id: string, changes: Partial<Invoice>) => void; onDelete?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(inv));

  const risk = riskLabel(inv);
  const dite = inv.afatiPageses !== "-" ? daysDiff(inv.afatiPageses) : null;
  const shumaNeTVSH = inv.shuma - inv.tvsh;

  const inputCls = "font-mono border border-blue-300 rounded px-1.5 py-0.5 outline-none focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-[1px]" onClick={onClose}/>
      <div className="w-[460px] bg-white h-full flex flex-col shadow-2xl">
        <div className={`px-5 py-4 border-b flex items-start justify-between flex-shrink-0
          ${inv.statusi==="vonuar"||(dite!==null&&dite<0) ? "bg-red-50 border-red-200"
          : inv.statusi==="pending" ? "bg-amber-50 border-amber-200"
          : inv.statusi==="duplikat" ? "bg-purple-50 border-purple-200"
          : "bg-slate-50 border-slate-200"}`}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {editing ? (
                <input value={draft.nrFatura} onChange={e => setDraft(d => ({ ...d, nrFatura: e.target.value }))}
                  className={`text-sm font-bold text-slate-800 ${inputCls}`} />
              ) : (
                <span className="font-mono text-base font-bold text-slate-800">{inv.nrFatura}</span>
              )}
              {editing ? (
                <select value={draft.lloji} onChange={e => setDraft(d => ({ ...d, lloji: e.target.value as InvoiceType }))}
                  className="text-[11px] border border-blue-300 rounded px-1 py-0.5 outline-none focus:border-blue-500 bg-white">
                  <option value="hyrëse">Hyrëse</option>
                  <option value="dalëse">Dalëse</option>
                  <option value="izvod">Izvod</option>
                </select>
              ) : (
                <TypeBadge t={inv.lloji}/>
              )}
              <StatusBadge s={inv.statusi}/>
              {risk && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${risk.cls}`}>{risk.label}</span>}
              {inv.edituar && <span className="text-[10px] px-1.5 py-0.5 rounded border font-semibold bg-blue-50 text-blue-700 border-blue-200">Edituar</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1">{inv.kompania} · <span className="font-mono">{inv.numriKompanise}</span></p>
            {inv.sektori && <p className="text-[10px] text-slate-400 mt-0.5">{inv.sektori}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-colors flex-shrink-0 ml-3">
            <X size={16}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Dokumenti i Skanuar</p>
            <InvoiceDocumentPreview inv={inv} />
          </div>

          {(editing || inv.pershkrim) && (
            <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <Info size={13} className="text-slate-400 mt-0.5 flex-shrink-0"/>
              {editing ? (
                <textarea value={draft.pershkrim} onChange={e => setDraft(d => ({ ...d, pershkrim: e.target.value }))} rows={2}
                  placeholder="Përshkrimi i faturës..."
                  className="w-full text-xs border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500 resize-none" />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">{inv.pershkrim}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Shumat</p>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-slate-50">
                <span className="text-xs text-slate-500">Shuma pa TVSH</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{fmt(shumaNeTVSH)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-xs text-slate-500">TVSH</span>
                {editing ? (
                  <input type="number" value={draft.tvsh} onChange={e => setDraft(d => ({ ...d, tvsh: Number(e.target.value) }))}
                    className={`text-xs w-24 text-right ${inputCls}`} />
                ) : inv.tvsh > 0 ? (
                  <span className="text-xs font-mono text-blue-600">{fmt(inv.tvsh)}</span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Pa TVSH</span>
                )}
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-800">
                <span className="text-xs font-bold text-white">TOTALI BRUTO</span>
                {editing ? (
                  <input type="number" value={draft.shuma} onChange={e => setDraft(d => ({ ...d, shuma: Number(e.target.value) }))}
                    className="text-sm font-mono font-bold text-slate-800 bg-white rounded px-2 py-0.5 w-32 text-right outline-none" />
                ) : (
                  <span className="text-sm font-mono font-bold text-white">{fmt(inv.shuma)}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Detajet</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"Data e Lëshimit",      value:inv.data,                                    Icon:Calendar, key:"data" as const },
                { label:"Afati i Pagesës",      value:inv.afatiPageses !== "-" ? inv.afatiPageses : "—", Icon:Clock, key:"afati" as const },
                { label:"Nr. Kompanisë (EMBS)", value:inv.numriKompanise,                          Icon:Hash, key:"numriKompanise" as const },
                { label:"Sektori",              value:inv.sektori ?? "—",                          Icon:Building2, key:"sektori" as const },
              ].map(({ label, value, Icon, key }) => (
                <div key={label} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={11} className="text-slate-400"/>
                    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                  </div>
                  {editing && key==="data" ? (
                    <input type="date" value={draft.data} onChange={e => setDraft(d => ({ ...d, data: e.target.value }))}
                      className={`text-xs font-semibold text-slate-700 w-full ${inputCls}`} />
                  ) : editing && key==="afati" ? (
                    <input type="date" value={draft.afatiPageses !== "-" ? draft.afatiPageses : ""}
                      onChange={e => setDraft(d => ({ ...d, afatiPageses: e.target.value || "-" }))}
                      className={`text-xs font-semibold text-slate-700 w-full ${inputCls}`} />
                  ) : editing && key==="numriKompanise" ? (
                    <input value={draft.numriKompanise} onChange={e => setDraft(d => ({ ...d, numriKompanise: e.target.value }))}
                      className={`text-xs font-semibold text-slate-700 w-full ${inputCls}`} />
                  ) : editing && key==="sektori" ? (
                    <input value={draft.sektori} onChange={e => setDraft(d => ({ ...d, sektori: e.target.value }))}
                      className={`text-xs font-semibold text-slate-700 w-full ${inputCls}`} />
                  ) : (
                    <p className="text-xs font-semibold text-slate-700 font-mono">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Skanimi OCR</p>
            <div className="p-3 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Besueshmëria</span>
                <OCRBar v={inv.ocr}/>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Konfirmimi</span>
                <span className={`text-[11px] font-semibold ${inv.ocr>=90?"text-emerald-700":"text-amber-700"}`}>
                  {inv.ocr>=90 ? "✓ Auto-konfirmuar (≥90%)" : "⏳ Kërkon rishikim manual"}
                </span>
              </div>
              {inv.edituar && (
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                  <Edit2 size={10} className="text-blue-400"/>
                  <span className="text-[11px] text-blue-600">Edituar — regjistrohet në audit trail</span>
                </div>
              )}
              {inv.duplikat && (
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                  <Copy size={10} className="text-purple-500"/>
                  <span className="text-[11px] text-purple-600">Faturë e dyfishtë — ID ekziston tashmë</span>
                </div>
              )}
            </div>
          </div>

          {inv.afatiPageses !== "-" && dite !== null && (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg border
              ${dite<0 ? "bg-red-50 border-red-200" : dite<=3 ? "bg-orange-50 border-orange-200" : dite<=7 ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-100"}`}>
              <Bell size={13} className={`mt-0.5 flex-shrink-0 ${dite<0?"text-red-600":dite<=3?"text-orange-600":"text-amber-600"}`}/>
              <div>
                <p className={`text-xs font-semibold ${dite<0?"text-red-700":dite<=3?"text-orange-700":"text-amber-700"}`}>
                  {dite<0 ? `Pagesa ka vonuar ${Math.abs(dite)} ditë — rrezik penaliteti!`
                   : dite===0 ? "Pagesa duhet të bëhet SOT!"
                   : `${dite} ditë deri në afat`}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Afati: {inv.afatiPageses}</p>
              </div>
            </div>
          )}
        </div>

        {canEditInvoices(role) ? (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2 flex-shrink-0">
            {confirmDelete ? (
              <>
                <span className="text-xs font-semibold text-red-700">A je i sigurt që do ta fshish këtë faturë?</span>
                <button onClick={() => onDelete?.(inv.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition-colors">
                  <Trash2 size={12}/>Po, Fshije
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700">
                  Anulo
                </button>
              </>
            ) : editing ? (
              <>
                <button onClick={() => { onSave?.(inv.id, { ...draft, pershkrim: draft.pershkrim || undefined, sektori: draft.sektori || undefined }); setEditing(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors">
                  <Save size={13}/>Ruaj Ndryshimet
                </button>
                <button onClick={() => { setDraft(toDraft(inv)); setEditing(false); }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                  Anulo
                </button>
              </>
            ) : (
              <>
                {inv.statusi==="pending" && (
                  <button onClick={() => { onConfirm(inv.id); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors">
                    <Check size={13}/>Konfirmo
                  </button>
                )}
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-md hover:bg-blue-100 transition-colors">
                  <Edit2 size={12}/>Edito
                </button>
                <button onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-md hover:bg-red-100 transition-colors">
                  <Trash2 size={12}/>{inv.duplikat ? "Fshi Duplikatin" : "Fshi"}
                </button>
              </>
            )}
            {!confirmDelete && <button onClick={onClose} className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors">Mbyll</button>}
          </div>
        ) : (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end flex-shrink-0">
            <button onClick={onClose} className="px-4 py-1.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-md hover:bg-slate-300 transition-colors">Mbyll</button>
          </div>
        )}
      </div>
    </div>
  );
}
