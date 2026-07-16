import { Invoice } from "../../types";
import { fmtNum } from "../../utils/format";

// Mockup i "fotos së skanuar" — jo OCR real, thjesht simulon pamjen e dokumentit fizik
// që do ta ngarkonte/skanonte përdoruesi, duke përdorur të dhënat aktuale të faturës.
export function InvoiceDocumentPreview({ inv }: { inv: Invoice }) {
  const net = inv.shuma - inv.tvsh;
  const linesCount = 2 + (inv.id.charCodeAt(0) % 3);
  const fakeLines = Array.from({ length: linesCount }, (_, i) => {
    const qty = 1 + ((inv.id.charCodeAt(0) + i) % 4);
    const price = Math.round((net / linesCount / qty) / 10) * 10;
    return { qty, price, total: qty * price };
  });

  return (
    <div className="flex justify-center py-2">
      <div className="relative w-[300px] bg-white border border-slate-200 rounded-sm shadow-lg p-4 -rotate-1"
        style={{ fontFamily: "monospace" }}>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-red-200 flex items-center justify-center rotate-12 shadow-sm">
          <span className="text-[7px] font-bold text-red-400">SCAN</span>
        </div>
        <div className="text-center border-b border-dashed border-slate-300 pb-2 mb-2">
          <p className="text-[11px] font-bold text-slate-800 tracking-wide">{inv.kompania.toUpperCase()}</p>
          <p className="text-[8px] text-slate-400">EMBS: {inv.numriKompanise}</p>
          <p className="text-[9px] font-semibold text-slate-600 mt-1">{inv.lloji === "izvod" ? "IZVOD BANKAR" : "FATURË"}</p>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500 mb-2">
          <span>Nr: {inv.nrFatura}</span>
          <span>{inv.data}</span>
        </div>
        <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
          {fakeLines.map((l, i) => (
            <div key={i} className="flex justify-between text-[8px] text-slate-500">
              <span>Artikull/Shërbim {i + 1} x{l.qty}</span>
              <span>{fmtNum(l.total)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-0.5 text-[8px] text-slate-500">
          <div className="flex justify-between"><span>Neto</span><span>{fmtNum(net)}</span></div>
          {inv.tvsh > 0 && <div className="flex justify-between"><span>TVSH</span><span>{fmtNum(inv.tvsh)}</span></div>}
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-800 border-t border-slate-800 mt-1.5 pt-1.5">
          <span>TOTALI</span><span>{fmtNum(inv.shuma)} MKD</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="flex gap-[1px]">
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} className="bg-slate-800" style={{ width: (i % 3 === 0) ? 2 : 1, height: 14 }} />
            ))}
          </div>
          <p className="text-[6px] text-slate-300 italic">skanuar</p>
        </div>
      </div>
    </div>
  );
}
