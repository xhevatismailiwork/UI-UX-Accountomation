#!/bin/bash
set -e

echo "📁 Duke krijuar components/layout (Sidebar, Header)..."

# ── components/layout/Header.tsx ─────────────────────────────────────────────
cat > components/layout/Header.tsx << 'EOF'
import { ScanLine, Plus, Bell } from "lucide-react";
import { Role } from "../../types";
import { CompanySwitcher } from "./CompanySwitcher";
import { Company } from "../../types";

interface HeaderProps {
  title: string;
  role: Role;
  companies: Company[];
  activeCompanyId: string;
  onCompanyChange: (id: string) => void;
  pendingCount: number;
  riskCount: number;
  onScan: () => void;
  onNewInvoice: () => void;
}

export function Header({
  title, role, companies, activeCompanyId, onCompanyChange,
  pendingCount, riskCount, onScan, onNewInvoice,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[15px] font-bold text-slate-800 leading-tight">{title}</h1>
          <p className="text-[11px] text-slate-400">25 Qershor 2025 · FaturaSys</p>
        </div>
        {/* ⭐ Dropdown-i i kompanive — shfaqet gjithmonë te header-i */}
        <CompanySwitcher
          companies={companies}
          activeCompanyId={activeCompanyId}
          onChange={onCompanyChange}
        />
      </div>
      <div className="flex items-center gap-2.5">
        {role==="operator" && (
          <button onClick={onScan}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-md hover:bg-[#0f2647] transition-colors">
            <ScanLine size={13}/>Skano Faturë
          </button>
        )}
        {role==="admin" && (
          <>
            <button onClick={onScan}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-md hover:bg-slate-200 transition-colors">
              <ScanLine size={12}/>Skano
            </button>
            <button onClick={onNewInvoice}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-md hover:bg-[#0f2647] transition-colors">
              <Plus size={12}/>Faturë e Re
            </button>
          </>
        )}
        <div className="relative ml-1 cursor-pointer">
          <Bell size={17} className="text-slate-400 hover:text-slate-600 transition-colors"/>
          {(pendingCount+riskCount)>0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {pendingCount+riskCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
EOF
echo "  ✓ components/layout/Header.tsx"

# ── components/layout/Sidebar.tsx ─────────────────────────────────────────────
cat > components/layout/Sidebar.tsx << 'EOF'
import {
  LayoutDashboard, FileText, BookOpen, Building2, BarChart3,
  Settings, AlertTriangle, FileWarning, Banknote, BookMarked,
} from "lucide-react";
import { Role, View } from "../../types";

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  role: Role;
  setRole: (r: Role) => void;
  pendingCount: number;
  riskCount: number;
  alertCount: number;
}

const navGroups = [
  { type:"item",  id:"dashboard",  label:"Dashboard",      Icon:LayoutDashboard },
  { type:"group", id:"faturat_g",  label:"Faturat",         Icon:FileText, sub:[
    { id:"faturat"    as View, label:"Të Gjitha" },
    { id:"pending"    as View, label:"Pending" },
    { id:"izvodet"    as View, label:"Izvodet" },
  ]},
  { type:"group", id:"kontab_g",   label:"Kontabiliteti",   Icon:BookOpen, sub:[
    { id:"cashflow"   as View, label:"Cash-Flow" },
    { id:"klasat"     as View, label:"Klasat & Nënklasa" },
    { id:"bilanci"    as View, label:"Bilanci" },
    { id:"smetkoplan" as View, label:"Smetkoplan" },
  ]},
  { type:"item",  id:"kompanite",  label:"Kompanitë",       Icon:Building2 },
  { type:"item",  id:"raportet",   label:"Raportet & TVSH", Icon:BarChart3 },
  { type:"item",  id:"rrogat",     label:"Rrogat",          Icon:Banknote },
  { type:"item",  id:"cilesimet",  label:"Cilësimet",       Icon:Settings },
] as const;

export function Sidebar({ view, setView, role, setRole, pendingCount, riskCount, alertCount }: SidebarProps) {
  return (
    <aside className="w-56 flex flex-col flex-shrink-0 bg-[#1B3A6B]">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-400 rounded-md flex items-center justify-center flex-shrink-0"><BookMarked size={14} className="text-white"/></div>
          <div><p className="text-white font-bold text-sm leading-tight">FaturaSys</p><p className="text-blue-300 text-[10px]">Sistemi Kontabël</p></div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-blue-300 text-[10px] mb-1.5 uppercase tracking-wider font-semibold">Roli Aktiv</p>
        <select value={role} onChange={e=>setRole(e.target.value as Role)}
          className="w-full text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1.5 outline-none cursor-pointer">
          <option value="admin"    className="text-black bg-white">Administrator</option>
          <option value="operator" className="text-black bg-white">Operator</option>
          <option value="readonly" className="text-black bg-white">Vetëm Lexim</option>
        </select>
      </div>

      {(riskCount>0||alertCount>0) && (
        <div className="mx-3 mt-3 p-2.5 bg-red-900/30 border border-red-500/30 rounded-md">
          {riskCount>0  && <div className="flex items-center gap-2 text-[11px] text-red-300"><FileWarning size={11}/><span>{riskCount} fatura në rrezik</span></div>}
          {alertCount>0 && <div className={`flex items-center gap-2 text-[11px] text-amber-300 ${riskCount>0?"mt-1":""}`}><AlertTriangle size={11}/><span>{alertCount} kompani pa evidencë</span></div>}
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navGroups.map(item => {
          if (item.type==="group" && "sub" in item) {
            const active = item.sub.some((s:any)=>s.id===view);
            const badgeFor = (id: View) => id==="pending" ? pendingCount : 0;
            return (
              <div key={item.id}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold ${active?"text-white bg-white/10":"text-blue-200"}`}>
                  <item.Icon size={14} className="flex-shrink-0"/><span>{item.label}</span>
                </div>
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {item.sub.map((sub:any)=>(
                    <button key={sub.id} onClick={()=>setView(sub.id)}
                      className={`w-full flex items-center justify-between text-left text-xs py-1.5 px-2 rounded transition-colors
                        ${view===sub.id?"text-white bg-white/15 font-semibold":"text-blue-300 hover:text-white hover:bg-white/5"}`}>
                      <span>{sub.label}</span>
                      {badgeFor(sub.id)>0 && <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">{badgeFor(sub.id)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          const it = item as any;
          const active = view===it.id;
          const badge = it.id==="kompanite" ? alertCount : 0;
          return (
            <button key={it.id} onClick={()=>setView(it.id as View)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${active?"bg-white/15 text-white":"text-blue-200 hover:text-white hover:bg-white/5"}`}>
              <div className="flex items-center gap-2.5"><item.Icon size={14} className="flex-shrink-0"/><span>{it.label}</span></div>
              {badge>0 && <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">AP</div>
          <div className="min-w-0"><p className="text-white text-[11px] font-semibold truncate">Ana Petrovska</p><p className="text-blue-300 text-[10px]">Kontabiliste</p></div>
        </div>
      </div>
    </aside>
  );
}
EOF
echo "  ✓ components/layout/Sidebar.tsx"

echo ""
echo "📁 Duke krijuar components/modals..."

# ── components/modals/InvoiceModal.tsx ─────────────────────────────────────────────
cat > components/modals/InvoiceModal.tsx << 'EOF'
import { X, Info, Bell, Edit2, Copy, Check, Calendar, Clock, Hash, Building2 } from "lucide-react";
import { Invoice, Role } from "../../types";
import { riskLabel } from "../../utils/risk";
import { daysDiff, fmt } from "../../utils/format";
import { StatusBadge } from "../shared/StatusBadge";
import { TypeBadge } from "../shared/TypeBadge";
import { OCRBar } from "../shared/OCRBar";

export function InvoiceModal({ inv, role, onClose, onConfirm, onEdit }: {
  inv: Invoice; role: Role; onClose: () => void; onConfirm: (id:string) => void; onEdit?: ()=>void;
}) {
  const risk = riskLabel(inv);
  const dite = inv.afatiPageses !== "-" ? daysDiff(inv.afatiPageses) : null;
  const shumaNeTVSH = inv.shuma - inv.tvsh;

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
              <span className="font-mono text-base font-bold text-slate-800">{inv.nrFatura}</span>
              <TypeBadge t={inv.lloji}/>
              <StatusBadge s={inv.statusi}/>
              {risk && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${risk.cls}`}>{risk.label}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1">{inv.kompania} · <span className="font-mono">{inv.numriKompanise}</span></p>
            {inv.sektori && <p className="text-[10px] text-slate-400 mt-0.5">{inv.sektori}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-colors flex-shrink-0 ml-3">
            <X size={16}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {inv.pershkrim && (
            <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <Info size={13} className="text-slate-400 mt-0.5 flex-shrink-0"/>
              <p className="text-xs text-slate-600 leading-relaxed">{inv.pershkrim}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Shumat</p>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-slate-50">
                <span className="text-xs text-slate-500">Shuma pa TVSH</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{fmt(shumaNeTVSH)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-xs text-slate-500">TVSH</span>
                {inv.tvsh > 0
                  ? <span className="text-xs font-mono text-blue-600">{fmt(inv.tvsh)}</span>
                  : <span className="text-xs text-slate-400 italic">Pa TVSH</span>}
              </div>
              <div className="flex justify-between px-4 py-3 bg-slate-800">
                <span className="text-xs font-bold text-white">TOTALI BRUTO</span>
                <span className="text-sm font-mono font-bold text-white">{fmt(inv.shuma)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Detajet</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"Data e Lëshimit",      value:inv.data,                                    Icon:Calendar },
                { label:"Afati i Pagesës",      value:inv.afatiPageses !== "-" ? inv.afatiPageses : "—", Icon:Clock },
                { label:"Nr. Kompanisë (EMBS)", value:inv.numriKompanise,                          Icon:Hash },
                { label:"Sektori",              value:inv.sektori ?? "—",                          Icon:Building2 },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={11} className="text-slate-400"/>
                    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 font-mono">{value}</p>
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

        {role === "admin" ? (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2 flex-shrink-0">
            {inv.statusi==="pending" && (
              <button onClick={() => { onConfirm(inv.id); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors">
                <Check size={13}/>Konfirmo
              </button>
            )}
            <button onClick={() => onEdit?.()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-md hover:bg-blue-100 transition-colors">
              <Edit2 size={12}/>Edito
            </button>
            {inv.duplikat && (
              <button className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded-md hover:bg-red-100 transition-colors">
                <X size={12}/>Fshi Duplikatin
              </button>
            )}
            <button onClick={onClose} className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors">Mbyll</button>
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
EOF
echo "  ✓ components/modals/InvoiceModal.tsx"

echo ""
echo "✅ Pjesa 3a përfundoi: Header, Sidebar, InvoiceModal"
echo "   Pjesa 3b (tjetër): ScanModal, NewInvoiceModal, EditInvoiceModal, NewTransactionModal"