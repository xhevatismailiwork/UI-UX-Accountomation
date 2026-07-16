import { ScanLine, Plus, Bell } from "lucide-react";
import { Role } from "../../types";
import { canEditInvoices } from "../../utils/permissions";

interface HeaderProps {
  title: string;
  role: Role;
  pendingCount: number;
  riskCount: number;
  onScan: () => void;
  onNewInvoice: () => void;
}

export function Header({
  title, role, pendingCount, riskCount, onScan, onNewInvoice,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-[15px] font-bold text-slate-800 leading-tight">{title}</h1>
        <p className="text-[11px] text-slate-400">25 Qershor 2025 · FaturaSys</p>
      </div>
      <div className="flex items-center gap-2.5">
        {!canEditInvoices(role) && (
          <button onClick={onScan}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-md hover:bg-[#0f2647] transition-colors">
            <ScanLine size={13}/>Skano Faturë
          </button>
        )}
        {canEditInvoices(role) && (
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
