import {
  LayoutDashboard, FileText, BookOpen, Building2, BarChart3,
  Settings, AlertTriangle, FileWarning, Banknote, BookMarked, Users,
} from "lucide-react";
import { AppUser, Company, View } from "../../types";
import { canAccessUserManagement, canManageMultipleCompanies, ROLE_LABEL } from "../../utils/permissions";
import { tvshThresholdAlert } from "../../utils/risk";

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  users: AppUser[];
  currentUser: AppUser;
  onUserChange: (id: string) => void;
  companies: Company[];
  activeCompanyId: string;
  onCompanyChange: (id: string) => void;
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
  ]},
  { type:"item",  id:"kompanite",  label:"Kompanitë",       Icon:Building2 },
  { type:"item",  id:"raportet",   label:"Raportet & TVSH", Icon:BarChart3 },
  { type:"item",  id:"rrogat",     label:"Rrogat",          Icon:Banknote },
  { type:"item",  id:"cilesimet",  label:"Cilësimet",       Icon:Settings },
  { type:"item",  id:"perdoruesit",label:"Përdoruesit",     Icon:Users, usersOnly:true },
] as const;

const OPERATOR_NAV = [
  { id:"faturat" as View, label:"Faturat e Mia", Icon:FileText },
];

export function Sidebar({ view, setView, users, currentUser, onUserChange, companies, activeCompanyId, onCompanyChange, pendingCount, riskCount, alertCount }: SidebarProps) {
  const role = currentUser.roli;
  const initials = currentUser.emri.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="w-56 flex flex-col flex-shrink-0 bg-[#1B3A6B]">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-400 rounded-md flex items-center justify-center flex-shrink-0"><BookMarked size={14} className="text-white"/></div>
          <div><p className="text-white font-bold text-sm leading-tight">FaturaSys</p><p className="text-blue-300 text-[10px]">Sistemi Kontabël</p></div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-blue-300 text-[10px] mb-1.5 uppercase tracking-wider font-semibold">Përdoruesi Aktiv (Demo)</p>
        <select value={currentUser.id} onChange={e=>onUserChange(e.target.value)}
          className="w-full text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1.5 outline-none cursor-pointer">
          {users.map(u => (
            <option key={u.id} value={u.id} className="text-black bg-white">{u.emri} — {ROLE_LABEL[u.roli]}</option>
          ))}
        </select>
      </div>

      {(riskCount>0||alertCount>0) && role!=="operator" && (
        <div className="mx-3 mt-3 p-2.5 bg-red-900/30 border border-red-500/30 rounded-md">
          {riskCount>0  && <div className="flex items-center gap-2 text-[11px] text-red-300"><FileWarning size={11}/><span>{riskCount} fatura në rrezik</span></div>}
          {alertCount>0 && <div className={`flex items-center gap-2 text-[11px] text-amber-300 ${riskCount>0?"mt-1":""}`}><AlertTriangle size={11}/><span>{alertCount} kompani pa evidencë</span></div>}
        </div>
      )}

      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-blue-300 text-[10px] mb-1.5 uppercase tracking-wider font-semibold">Kompania Aktive ({companies.length})</p>
        {companies.length > 0 ? (
          <select value={activeCompanyId} onChange={e => onCompanyChange(e.target.value)}
            className="w-full text-xs bg-white/10 text-white border border-white/20 rounded px-2 py-1.5 outline-none cursor-pointer">
            {companies.map(c => {
              const alerted = c.alert || tvshThresholdAlert(c);
              return (
                <option key={c.id} value={c.numriKompanise} className="text-black bg-white">
                  {c.ikona} {c.emri}{alerted ? " ⚠" : ""}
                </option>
              );
            })}
          </select>
        ) : (
          <p className="text-[11px] text-blue-300">Asnjë kompani e deleguar</p>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {role==="operator" && OPERATOR_NAV.map(it => {
          const active = view===it.id;
          return (
            <button key={it.id} onClick={()=>setView(it.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${active?"bg-white/15 text-white":"text-blue-200 hover:text-white hover:bg-white/5"}`}>
              <it.Icon size={14} className="flex-shrink-0"/><span>{it.label}</span>
            </button>
          );
        })}
        {role!=="operator" && navGroups.filter(item => {
          if ("usersOnly" in item && item.usersOnly) return canAccessUserManagement(role);
          if (item.id==="kompanite") return canManageMultipleCompanies(role);
          return true;
        }).map(item => {
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
          <div className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">{initials}</div>
          <div className="min-w-0"><p className="text-white text-[11px] font-semibold truncate">{currentUser.emri}</p><p className="text-blue-300 text-[10px]">{ROLE_LABEL[role]}</p></div>
        </div>
      </div>
    </aside>
  );
}
