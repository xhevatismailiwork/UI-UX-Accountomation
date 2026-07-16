import { useEffect, useState } from "react";
import { X, ScanLine, CheckCircle2, Loader2 } from "lucide-react";
import { Company, Invoice } from "../../types";
import { OCRBar } from "../shared/OCRBar";
import { InvoiceDocumentPreview } from "../shared/InvoiceDocumentPreview";
import { fmt, addDays, TODAY } from "../../utils/format";

interface ScanModalProps {
  company: Company;
  onClose: () => void;
  onCreate: (inv: Invoice) => void;
}

const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

export function ScanModal({ company, onClose, onCreate }: ScanModalProps) {
  const [phase, setPhase] = useState<"scanning" | "result">("scanning");
  const [result, setResult] = useState<Invoice | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const shuma = rand(8000, 320000);
      const isPaTvsh = company.tvshTipi === "pa_tvsh";
      const tvsh = isPaTvsh ? 0 : Math.round(shuma / 6);
      const ocr = rand(58, 99);
      const today = TODAY.toISOString().slice(0, 10);
      const inv: Invoice = {
        id: `scan-${Date.now()}`,
        nrFatura: `FAT-2025-0${rand(400, 999)}`,
        data: today,
        shuma,
        tvsh,
        kompania: company.emri,
        numriKompanise: company.numriKompanise,
        sektori: company.sektori,
        lloji: "hyrëse",
        statusi: ocr >= 90 ? "konfirmuar" : "pending",
        ocr,
        afatiPageses: addDays(today, 20),
        edituar: false,
        duplikat: false,
        prioritet: ocr < 90 ? rand(1, 3) : undefined,
        pershkrim: "Faturë e skanuar automatikisht via OCR",
      };
      setResult(inv);
      setPhase("result");
    }, 1400);
    return () => clearTimeout(t);
  }, [company]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="w-[420px] bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine size={15} className="text-blue-600" />
            <p className="text-sm font-bold text-slate-800">Skano Faturë (OCR)</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md"><X size={15} /></button>
        </div>

        {phase === "scanning" ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <Loader2 size={26} className="text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500">Duke lexuar dokumentin dhe duke nxjerrë të dhënat...</p>
          </div>
        ) : result && (
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={14} />
              <p className="text-xs font-semibold">Skanimi përfundoi</p>
            </div>
            <InvoiceDocumentPreview inv={result} />
            <p className="text-[10px] text-slate-400 text-center -mt-2">↑ Dokumenti i skanuar · të dhënat u nxorën automatikisht më poshtë</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
                <p className="text-[10px] text-slate-400">Nr. Faturës</p>
                <p className="font-mono font-semibold text-slate-700">{result.nrFatura}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
                <p className="text-[10px] text-slate-400">Data</p>
                <p className="font-mono font-semibold text-slate-700">{result.data}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 col-span-2">
                <p className="text-[10px] text-slate-400">Shuma Totale</p>
                <p className="font-mono font-bold text-slate-800">{fmt(result.shuma)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 border border-slate-200 rounded-md">
              <span className="text-xs text-slate-500">Besueshmëria OCR</span>
              <OCRBar v={result.ocr} />
            </div>
            <p className="text-[11px] text-slate-500">
              {result.ocr >= 90
                ? "Konfidenca ≥ 90% — fatura konfirmohet automatikisht."
                : "Konfidenca < 90% — fatura kalon në Pending Review për kontabilistin."}
            </p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { onCreate(result); onClose(); }}
                className="flex-1 px-4 py-2 bg-[#1B3A6B] text-white text-xs font-bold rounded-md hover:bg-[#0f2647] transition-colors">
                Ruaj Faturën
              </button>
              <button onClick={onClose} className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600">Anulo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
