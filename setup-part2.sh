#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────────────────
# Pjesa 2: components/shared + components/layout (+ CompanySwitcher i ri)
# Ekzekuto NGA BRENDA folderit "src/" (aty ku vetë folderi "components" ekziston)
#   chmod +x setup-part2.sh
#   ./setup-part2.sh
# ─────────────────────────────────────────────────────────────────────────

echo "📁 Duke krijuar components/shared dhe components/layout..."

# ── components/shared/Card.tsx ─────────────────────────────────────────────
cat > components/shared/Card.tsx << 'EOF'
export function Card({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>{children}</div>;
}
EOF
echo "  ✓ components/shared/Card.tsx"

# ── components/shared/SectionHeader.tsx ─────────────────────────────────────────────
cat > components/shared/SectionHeader.tsx << 'EOF'
export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-4 py-3 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
EOF
echo "  ✓ components/shared/SectionHeader.tsx"

# ── components/shared/StatusBadge.tsx ─────────────────────────────────────────────
cat > components/shared/StatusBadge.tsx << 'EOF'
import { CheckCircle, Clock, XCircle, Copy, AlertTriangle } from "lucide-react";
import { InvoiceStatus } from "../../types";

export function StatusBadge({ s }: { s: InvoiceStatus }) {
  const map: Record<InvoiceStatus,{label:string;cls:string;Icon:any}> = {
    konfirmuar: { label:"Konfirmuar", cls:"bg-emerald-50 text-emerald-700 border-emerald-200", Icon:CheckCircle },
    pending:    { label:"Pending",    cls:"bg-amber-50 text-amber-700 border-amber-200",       Icon:Clock },
    refuzuar:   { label:"Refuzuar",   cls:"bg-red-50 text-red-700 border-red-200",             Icon:XCircle },
    duplikat:   { label:"Duplikat",   cls:"bg-purple-50 text-purple-700 border-purple-200",    Icon:Copy },
    vonuar:     { label:"Vonuar",     cls:"bg-red-100 text-red-800 border-red-300",            Icon:AlertTriangle },
  };
  const { label, cls, Icon } = map[s];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${cls}`}>
      <Icon size={10}/>{label}
    </span>
  );
}
EOF
echo "  ✓ components/shared/StatusBadge.tsx"

# ── components/shared/TVSHBadge.tsx ─────────────────────────────────────────────
cat > components/shared/TVSHBadge.tsx << 'EOF'
import { TVSHType } from "../../types";

export function TVSHBadge({ t }: { t: TVSHType }) {
  const map: Record<TVSHType,{label:string;cls:string}> = {
    pa_tvsh:        { label:"Pa TVSH",       cls:"bg-slate-100 text-slate-600 border-slate-200" },
    tvsh_tremujore: { label:"TVSH Tremujore", cls:"bg-blue-50 text-blue-700 border-blue-200" },
    tvsh_mujore:    { label:"TVSH Mujore",   cls:"bg-indigo-50 text-indigo-700 border-indigo-200" },
  };
  const { label, cls } = map[t];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cls}`}>{label}</span>;
}
EOF
echo "  ✓ components/shared/TVSHBadge.tsx"

# ── components/shared/TypeBadge.tsx ─────────────────────────────────────────────
cat > components/shared/TypeBadge.tsx << 'EOF'
import { Landmark, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { InvoiceType } from "../../types";

export function TypeBadge({ t }: { t: InvoiceType }) {
  if (t==="izvod")  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-[11px] font-medium"><Landmark size={9}/>Izvod</span>;
  if (t==="hyrëse") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[11px] font-medium"><ArrowDownRight size={9}/>Hyrëse</span>;
  return                   <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[11px] font-medium"><ArrowUpRight size={9}/>Dalëse</span>;
}
EOF
echo "  ✓ components/shared/TypeBadge.tsx"

# ── components/shared/OCRBar.tsx ─────────────────────────────────────────────
cat > components/shared/OCRBar.tsx << 'EOF'
export function OCRBar({ v }: { v: number }) {
  const color = v>=90 ? "bg-emerald-500" : v>=75 ? "bg-amber-400" : "bg-red-400";
  const text  = v>=90 ? "text-emerald-700" : v>=75 ? "text-amber-700" : "text-red-600";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color}`} style={{ width:`${v}%` }}/>
      </div>
      <span className={`text-[11px] font-mono font-semibold ${text}`}>{v}%</span>
      {v>=90 && <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">AUTO</span>}
    </div>
  );
}
EOF
echo "  ✓ components/shared/OCRBar.tsx"

# ── components/shared/index.ts (barrel export) ─────────────────────────────────────────────
cat > components/shared/index.ts << 'EOF'
export { Card } from "./Card";
export { SectionHeader } from "./SectionHeader";
export { StatusBadge } from "./StatusBadge";
export { TVSHBadge } from "./TVSHBadge";
export { TypeBadge } from "./TypeBadge";
export { OCRBar } from "./OCRBar";
EOF
echo "  ✓ components/shared/index.ts (barrel export)"

echo ""
echo "📁 Duke krijuar components/layout..."

# ── components/layout/CompanySwitcher.tsx ⭐ E RE ─────────────────────────────────────────────
cat > components/layout/CompanySwitcher.tsx << 'EOF'
import { Company } from "../../types";

interface CompanySwitcherProps {
  companies: Company[];
  activeCompanyId: string;
  onChange: (companyId: string) => void;
}

// ⭐ Komponenti i ri — dropdown-i qendror i kompanive.
// Kur ndryshon, gjithçka (faturat, cash-flow, rrogat, etj.) ndryshon automatikisht
// sepse App.tsx e përdor `activeCompanyId` për të marrë COMPANY_DATA[id] përkatëse.
export function CompanySwitcher({ companies, activeCompanyId, onChange }: CompanySwitcherProps) {
  const active = companies.find(c => c.numriKompanise === activeCompanyId);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg leading-none">{active?.ikona}</span>
      <select
        value={activeCompanyId}
        onChange={e => onChange(e.target.value)}
        className="text-xs font-semibold border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 outline-none cursor-pointer hover:border-blue-300 transition-colors"
      >
        {companies.map(c => (
          <option key={c.id} value={c.numriKompanise}>
            {c.ikona} {c.emri}
          </option>
        ))}
      </select>
      {active?.alert && (
        <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
          Alert
        </span>
      )}
    </div>
  );
}
EOF
echo "  ✓ components/layout/CompanySwitcher.tsx ⭐ (E RE)"

echo ""
echo "✅ Gati! Pjesa 2 përfundoi — 8 file (6 shared + barrel + CompanySwitcher)"
echo "   Hapi tjetër (Pjesa 3): Sidebar.tsx, Header.tsx, dhe modalet"
