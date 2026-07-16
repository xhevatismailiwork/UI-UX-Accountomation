import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Company, Invoice, InvoiceType } from "../../types";
import { addDays, fmtNum, TODAY } from "../../utils/format";

interface NewInvoiceModalProps {
  company: Company;
  onClose: () => void;
  onCreate: (inv: Invoice) => void;
}

export function NewInvoiceModal({ company, onClose, onCreate }: NewInvoiceModalProps) {
  const today = TODAY.toISOString().slice(0, 10);
  const [lloji, setLloji] = useState<InvoiceType>("dalëse");
  const [nrFatura, setNrFatura] = useState("");
  const [data, setData] = useState(today);
  const [shuma, setShuma] = useState<number | "">("");
  const [pershkrim, setPershkrim] = useState("");

  const isPaTvsh = company.tvshTipi === "pa_tvsh";
  const valid = nrFatura.trim().length > 0 && typeof shuma === "number" && shuma > 0;

  const submit = () => {
    if (!valid || typeof shuma !== "number") return;
    const tvsh = isPaTvsh ? 0 : Math.round(shuma / 6);
    const inv: Invoice = {
      id: `manual-${Date.now()}`,
      nrFatura,
      data,
      shuma,
      tvsh,
      kompania: company.emri,
      numriKompanise: company.numriKompanise,
      sektori: company.sektori,
      lloji,
      statusi: "konfirmuar",
      ocr: 100,
      afatiPageses: addDays(data, 30),
      edituar: false,
      duplikat: false,
      pershkrim: pershkrim || undefined,
    };
    onCreate(inv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="w-[440px] bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Faturë e Re (Manuale)</p>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md"><X size={15} /></button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] text-slate-400 font-medium">Lloji</label>
            <div className="flex gap-2 mt-1">
              {(["hyrëse", "dalëse"] as InvoiceType[]).map(t => (
                <button key={t} onClick={() => setLloji(t)}
                  className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors
                    ${lloji === t ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                  {t === "hyrëse" ? "Hyrëse" : "Dalëse"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Nr. Faturës</label>
              <input value={nrFatura} onChange={e => setNrFatura(e.target.value)} placeholder="FAT-2025-0400"
                className="w-full mt-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)}
                className="w-full mt-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium">Shuma Totale (MKD)</label>
            <input type="number" value={shuma} onChange={e => setShuma(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0"
              className="w-full mt-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
            {!isPaTvsh && typeof shuma === "number" && shuma > 0 && (
              <p className="text-[10px] text-slate-400 mt-1">TVSH (llogaritur automatikisht): {fmtNum(Math.round(shuma / 6))} MKD</p>
            )}
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium">Përshkrimi (opsional)</label>
            <textarea value={pershkrim} onChange={e => setPershkrim(e.target.value)} rows={2}
              className="w-full mt-1 text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <button onClick={submit} disabled={!valid}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white text-xs font-bold rounded-md hover:bg-[#0f2647] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Plus size={13} />Regjistro Faturën
          </button>
          <button onClick={onClose} className="ml-auto text-xs text-slate-400 hover:text-slate-600">Anulo</button>
        </div>
      </div>
    </div>
  );
}
