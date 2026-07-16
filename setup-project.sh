#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────────────────
# Script për ristrukturimin e projektit FaturaSys (Figma Make)
# Ekzekuto këtë NGA BRENDA folderit "src/app/" të projektit tënd:
#   chmod +x setup-project.sh
#   ./setup-project.sh
# ─────────────────────────────────────────────────────────────────────────

echo "📁 Duke krijuar strukturën e folderave..."
mkdir -p types data hooks utils components/shared components/layout components/modals components/views

# ── types/index.ts ─────────────────────────────────────────────────────────
cat > types/index.ts << 'EOF'
// ── Types ─────────────────────────────────────────────────────────────────────
export type Role = "admin" | "operator" | "readonly";
export type InvoiceStatus = "konfirmuar" | "pending" | "refuzuar" | "duplikat" | "vonuar";
export type InvoiceType = "hyrëse" | "dalëse" | "izvod";
export type TVSHType = "pa_tvsh" | "tvsh_tremujore" | "tvsh_mujore";
export type View =
  | "dashboard" | "faturat" | "pending" | "izvodet"
  | "cashflow" | "klasat" | "bilanci" | "smetkoplan"
  | "kompanite" | "raportet" | "rrogat" | "cilesimet";

export interface Invoice {
  id: string; nrFatura: string; data: string; shuma: number; tvsh: number;
  kompania: string; numriKompanise: string; lloji: InvoiceType; sektori?: string;
  statusi: InvoiceStatus; ocr: number; afatiPageses: string;
  edituar: boolean; duplikat: boolean; prioritet?: number; pershkrim?: string;
}

export interface Company {
  id: string; emri: string; numriKompanise: string; tvshTipi: TVSHType;
  qarkullimi: number; faturaFundit: string; alert: boolean; alertTip?: string;
  sektori: string; ikona: string;
}
EOF
echo "  ✓ types/index.ts"

# ── utils/format.ts ─────────────────────────────────────────────────────────
cat > utils/format.ts << 'EOF'
export const TODAY = new Date("2025-06-25");

export const daysDiff = (d: string) =>
  Math.ceil((new Date(d).getTime() - TODAY.getTime()) / 86400000);

export const fmt = (n: number) => n.toLocaleString("mk-MK") + " MKD";

export const fmtK = (n: number) => {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (Math.abs(n) >= 1000)    return (n / 1000).toFixed(0) + "K";
  return n.toString();
};
EOF
echo "  ✓ utils/format.ts"

# ── utils/risk.ts ─────────────────────────────────────────────────────────
cat > utils/risk.ts << 'EOF'
import { Invoice, Company } from "../types";
import { daysDiff } from "./format";

export function riskLabel(inv: Invoice): { label: string; cls: string } | null {
  if (inv.statusi === "vonuar") return { label:"Vonuar", cls:"bg-red-100 text-red-700 border-red-200" };
  if (inv.statusi === "pending" && inv.afatiPageses !== "-") {
    const d = daysDiff(inv.afatiPageses);
    if (d < 0)  return { label:`${Math.abs(d)}d vonuar`, cls:"bg-red-100 text-red-700 border-red-200" };
    if (d <= 3) return { label:`${d}d mbeten`, cls:"bg-orange-100 text-orange-700 border-orange-200" };
  }
  if (inv.ocr < 70 && inv.statusi === "pending")
    return { label:"OCR i ulët", cls:"bg-purple-50 text-purple-700 border-purple-200" };
  return null;
}

// Funksioni që mungonte dhe shkaktonte gabimin ⚠️
export function tvshThresholdAlert(c: Company): { pct: number } | null {
  if (c.tvshTipi === "pa_tvsh" && c.qarkullimi >= 1_500_000) {
    return { pct: Math.round((c.qarkullimi / 2_000_000) * 100) };
  }
  if (c.tvshTipi === "tvsh_tremujore" && c.qarkullimi >= 20_000_000) {
    return { pct: Math.round((c.qarkullimi / 25_000_000) * 100) };
  }
  return null;
}
EOF
echo "  ✓ utils/risk.ts"

# ── data/companies.ts ─────────────────────────────────────────────────────────
cat > data/companies.ts << 'EOF'
import { Company } from "../types";

export const COMPANIES: Company[] = [
  { id:"1",  emri:"TechSoft DOOEL",             numriKompanise:"7891234", tvshTipi:"tvsh_tremujore", qarkullimi:8450000,  faturaFundit:"2025-06-12", alert:false, sektori:"IT & Software",     ikona:"💻" },
  { id:"2",  emri:"Merkur AD",                  numriKompanise:"4521789", tvshTipi:"tvsh_mujore",    qarkullimi:34200000, faturaFundit:"2025-06-21", alert:false, sektori:"Tregtia me Pakicë", ikona:"🛒" },
  { id:"3",  emri:"BuildPro DOOEL",             numriKompanise:"3318765", tvshTipi:"tvsh_tremujore", qarkullimi:5800000,  faturaFundit:"2025-06-05", alert:false, sektori:"Ndërtimtari",      ikona:"🏗️" },
  { id:"4",  emri:"AlbaTrade SH.P.K.",          numriKompanise:"9987654", tvshTipi:"tvsh_mujore",    qarkullimi:28900000, faturaFundit:"2025-06-22", alert:false, sektori:"Import / Export",   ikona:"🚢" },
  { id:"5",  emri:"EcoSupply DOOEL",            numriKompanise:"6654321", tvshTipi:"pa_tvsh",        qarkullimi:1450000,  faturaFundit:"2025-06-10", alert:false, sektori:"Mjedis & Eko",     ikona:"🌿" },
  { id:"6",  emri:"Prime Invest AD",            numriKompanise:"1123456", tvshTipi:"tvsh_tremujore", qarkullimi:12300000, faturaFundit:"2025-06-18", alert:false, sektori:"Investime & Prona", ikona:"🏢" },
  { id:"7",  emri:"Agro Fruti DOOEL",           numriKompanise:"8876543", tvshTipi:"pa_tvsh",        qarkullimi:780000,   faturaFundit:"2025-06-19", alert:false, sektori:"Bujqësi",           ikona:"🌾" },
  { id:"8",  emri:"Nova Gradba SH.P.K.",        numriKompanise:"2234567", tvshTipi:"tvsh_tremujore", qarkullimi:3200000,  faturaFundit:"2025-05-10", alert:true,  alertTip:"35 ditë pa aktivitet", sektori:"Ndërtimtari", ikona:"🏚️" },
  { id:"9",  emri:"BioFarm DOOEL",              numriKompanise:"5543210", tvshTipi:"pa_tvsh",        qarkullimi:1890000,  faturaFundit:"2025-04-28", alert:true,  alertTip:"58 ditë — Pragu TVSH i kaluar!", sektori:"Bujqësi", ikona:"🌱" },
  { id:"10", emri:"Farmacia Vita DOOEL",        numriKompanise:"6612345", tvshTipi:"pa_tvsh",        qarkullimi:1200000,  faturaFundit:"2025-06-16", alert:false, sektori:"Farmaci",           ikona:"💊" },
  { id:"11", emri:"Restoran Kalemi SH.P.K.",    numriKompanise:"3345678", tvshTipi:"pa_tvsh",        qarkullimi:890000,   faturaFundit:"2025-06-22", alert:false, sektori:"Gastronomia",       ikona:"🍽️" },
  { id:"12", emri:"Shkolla Private Iliri",      numriKompanise:"7723456", tvshTipi:"tvsh_tremujore", qarkullimi:4500000,  faturaFundit:"2025-06-25", alert:false, sektori:"Arsim",             ikona:"🎓" },
  { id:"13", emri:"Auto Servis Petreski DOOEL", numriKompanise:"4456789", tvshTipi:"tvsh_tremujore", qarkullimi:3800000,  faturaFundit:"2025-06-23", alert:false, sektori:"Automotive",        ikona:"🔧" },
];
EOF
echo "  ✓ data/companies.ts"

# ── data/invoices.ts ─────────────────────────────────────────────────────────
cat > data/invoices.ts << 'EOF'
import { Invoice } from "../types";

export const INVOICES: Invoice[] = [
  { id:"1",  nrFatura:"FAT-2025-0341", data:"2025-06-01", shuma:145200,  tvsh:24200,  kompania:"TechSoft DOOEL",             numriKompanise:"7891234",  sektori:"IT", lloji:"hyrëse", statusi:"konfirmuar", ocr:96,  afatiPageses:"2025-07-01", edituar:false, duplikat:false, pershkrim:"Licenca softuerike Microsoft 365 — 25 përdorues" },
  { id:"6",  nrFatura:"FAT-2025-0346", data:"2025-06-12", shuma:192000,  tvsh:32000,  kompania:"TechSoft DOOEL",             numriKompanise:"7891234",  sektori:"IT", lloji:"dalëse", statusi:"konfirmuar", ocr:99,  afatiPageses:"2025-07-12", edituar:true,  duplikat:false, pershkrim:"Shërbime zhvillimi web — Faza 2" },
  { id:"2",  nrFatura:"FAT-2025-0342", data:"2025-06-03", shuma:320000,  tvsh:0,      kompania:"Merkur AD",                  numriKompanise:"4521789",  sektori:"Tregtia", lloji:"dalëse", statusi:"konfirmuar", ocr:98,  afatiPageses:"2025-07-03", edituar:false, duplikat:false, pershkrim:"Shitje produktesh shtëpiake — Lot 12" },
  { id:"11", nrFatura:"FAT-2025-0349", data:"2025-06-21", shuma:67800,   tvsh:11300,  kompania:"Merkur AD",                  numriKompanise:"4521789",  sektori:"Tregtia", lloji:"hyrëse", statusi:"pending",    ocr:78,  afatiPageses:"2025-07-01", edituar:false, duplikat:false, prioritet:3, pershkrim:"Furnizim paketimi dhe materiale ekspedite" },
  { id:"3",  nrFatura:"FAT-2025-0343", data:"2025-06-05", shuma:87500,   tvsh:14583,  kompania:"BuildPro DOOEL",             numriKompanise:"3318765",  sektori:"Ndërtim", lloji:"hyrëse", statusi:"pending",    ocr:72,  afatiPageses:"2025-06-25", edituar:false, duplikat:false, prioritet:1, pershkrim:"Çimento dhe materiale ndërtimi — Objekt Tetovë" },
  { id:"7",  nrFatura:"FAT-2025-0343", data:"2025-06-14", shuma:87500,   tvsh:14583,  kompania:"BuildPro DOOEL",             numriKompanise:"3318765",  sektori:"Ndërtim", lloji:"hyrëse", statusi:"duplikat",   ocr:88,  afatiPageses:"2025-06-25", edituar:false, duplikat:true,  pershkrim:"Çimento dhe materiale ndërtimi — DUPLIKAT i FAT-0343" },
  { id:"4",  nrFatura:"FAT-2025-0344", data:"2025-06-08", shuma:560000,  tvsh:93333,  kompania:"AlbaTrade SH.P.K.",          numriKompanise:"9987654",  sektori:"Import/Export", lloji:"dalëse", statusi:"konfirmuar", ocr:95,  afatiPageses:"2025-07-08", edituar:false, duplikat:false, pershkrim:"Eksport tekstile — Destinacion Gjermani" },
  { id:"12", nrFatura:"FAT-2025-0350", data:"2025-06-22", shuma:890000,  tvsh:148333, kompania:"AlbaTrade SH.P.K.",          numriKompanise:"9987654",  sektori:"Import/Export", lloji:"dalëse", statusi:"konfirmuar", ocr:97,  afatiPageses:"2025-07-22", edituar:false, duplikat:false, pershkrim:"Import elektronikë — Destinacion Shqipëri" },
  { id:"5",  nrFatura:"FAT-2025-0345", data:"2025-06-10", shuma:34200,   tvsh:5700,   kompania:"EcoSupply DOOEL",            numriKompanise:"6654321",  sektori:"Mjedisi", lloji:"hyrëse", statusi:"pending",    ocr:81,  afatiPageses:"2025-06-27", edituar:false, duplikat:false, prioritet:2, pershkrim:"Furnizim ambalazhe bio dhe etiketa eko" },
  { id:"8",  nrFatura:"FAT-2025-0347", data:"2025-06-18", shuma:445000,  tvsh:74167,  kompania:"Prime Invest AD",            numriKompanise:"1123456",  sektori:"Investime", lloji:"dalëse", statusi:"pending",    ocr:65,  afatiPageses:"2025-06-22", edituar:false, duplikat:false, prioritet:1, pershkrim:"Shitje apartamentesh — Projekti Panorama" },
  { id:"13", nrFatura:"FAT-2025-0351", data:"2025-06-23", shuma:156000,  tvsh:26000,  kompania:"Prime Invest AD",            numriKompanise:"1123456",  sektori:"Investime", lloji:"hyrëse", statusi:"konfirmuar", ocr:94,  afatiPageses:"2025-07-23", edituar:false, duplikat:false, pershkrim:"Materiale të ndërtimit — Projekti Panorama" },
  { id:"9",  nrFatura:"FAT-2025-0348", data:"2025-06-19", shuma:28900,   tvsh:0,      kompania:"Agro Fruti DOOEL",           numriKompanise:"8876543",  sektori:"Bujqësia", lloji:"hyrëse", statusi:"vonuar",     ocr:93,  afatiPageses:"2025-06-19", edituar:false, duplikat:false, pershkrim:"Farëra dhe pesticide — Sezoni Veror" },
  { id:"10", nrFatura:"IZVOD-06-2025A",data:"2025-06-20", shuma:1240000, tvsh:0,      kompania:"Stopanska Banka",            numriKompanise:"BANKA-001",sektori:"Banka", lloji:"izvod",  statusi:"konfirmuar", ocr:100, afatiPageses:"-",           edituar:false, duplikat:false },
  { id:"14", nrFatura:"IZVOD-06-2025B",data:"2025-06-24", shuma:890000,  tvsh:0,      kompania:"NLB Banka",                  numriKompanise:"BANKA-002",sektori:"Banka", lloji:"izvod",  statusi:"konfirmuar", ocr:100, afatiPageses:"-",           edituar:false, duplikat:false },
  { id:"15", nrFatura:"FAT-2025-0352", data:"2025-06-02", shuma:245000,  tvsh:0,      kompania:"Farmacia Vita DOOEL",        numriKompanise:"6612345",  sektori:"Farmaci", lloji:"hyrëse", statusi:"konfirmuar", ocr:97,  afatiPageses:"2025-07-02", edituar:false, duplikat:false, pershkrim:"Blerje ilaçesh me recetë — Partida Qershor" },
  { id:"16", nrFatura:"FAT-2025-0353", data:"2025-06-16", shuma:180000,  tvsh:0,      kompania:"Farmacia Vita DOOEL",        numriKompanise:"6612345",  sektori:"Farmaci", lloji:"dalëse", statusi:"pending",    ocr:83,  afatiPageses:"2025-06-28", edituar:false, duplikat:false, prioritet:2, pershkrim:"Shitje me shumicë ilaçe OTC — Spital Tetovë" },
  { id:"17", nrFatura:"FAT-2025-0355", data:"2025-06-11", shuma:89000,   tvsh:0,      kompania:"Farmacia Vita DOOEL",        numriKompanise:"6612345",  sektori:"Farmaci", lloji:"hyrëse", statusi:"vonuar",     ocr:91,  afatiPageses:"2025-06-20", edituar:false, duplikat:false, pershkrim:"Furnizim pajisje mjekësore — oksigjenator" },
  { id:"18", nrFatura:"FAT-2025-0354", data:"2025-06-04", shuma:67000,   tvsh:0,      kompania:"Restoran Kalemi SH.P.K.",    numriKompanise:"3345678",  sektori:"Gastronomia", lloji:"hyrëse", statusi:"konfirmuar", ocr:92,  afatiPageses:"2025-07-04", edituar:false, duplikat:false, pershkrim:"Furnizim ushqimor — Mish, perime, produkte bulmeti" },
  { id:"19", nrFatura:"FAT-2025-0356", data:"2025-06-17", shuma:42500,   tvsh:0,      kompania:"Restoran Kalemi SH.P.K.",    numriKompanise:"3345678",  sektori:"Gastronomia", lloji:"dalëse", statusi:"pending",    ocr:69,  afatiPageses:"2025-06-24", edituar:false, duplikat:false, prioritet:1, pershkrim:"Catering — Konferencë e Bashkisë, 200 persona" },
  { id:"20", nrFatura:"FAT-2025-0361", data:"2025-06-22", shuma:31200,   tvsh:0,      kompania:"Restoran Kalemi SH.P.K.",    numriKompanise:"3345678",  sektori:"Gastronomia", lloji:"hyrëse", statusi:"konfirmuar", ocr:95,  afatiPageses:"2025-07-22", edituar:false, duplikat:false, pershkrim:"Pije dhe birrë — Distributor Pivara Skopje" },
  { id:"21", nrFatura:"FAT-2025-0357", data:"2025-06-06", shuma:380000,  tvsh:63333,  kompania:"Shkolla Private Iliri",      numriKompanise:"7723456",  sektori:"Arsimi", lloji:"hyrëse", statusi:"konfirmuar", ocr:98,  afatiPageses:"2025-07-06", edituar:false, duplikat:false, pershkrim:"Pajisje laboratori — Kompjuterë dhe projektorë" },
  { id:"22", nrFatura:"FAT-2025-0358", data:"2025-06-13", shuma:1250000, tvsh:208333, kompania:"Shkolla Private Iliri",      numriKompanise:"7723456",  sektori:"Arsimi", lloji:"dalëse", statusi:"konfirmuar", ocr:99,  afatiPageses:"2025-07-13", edituar:false, duplikat:false, pershkrim:"Tarifat e regjistrimit — Viti Akademik 2025/26" },
  { id:"23", nrFatura:"FAT-2025-0362", data:"2025-06-25", shuma:95000,   tvsh:15833,  kompania:"Shkolla Private Iliri",      numriKompanise:"7723456",  sektori:"Arsimi", lloji:"hyrëse", statusi:"pending",    ocr:76,  afatiPageses:"2025-07-15", edituar:false, duplikat:false, prioritet:3, pershkrim:"Libra shkollore dhe materiale didaktike" },
  { id:"24", nrFatura:"FAT-2025-0359", data:"2025-06-09", shuma:345000,  tvsh:57500,  kompania:"Auto Servis Petreski DOOEL", numriKompanise:"4456789",  sektori:"Automotive", lloji:"hyrëse", statusi:"pending",    ocr:58,  afatiPageses:"2025-06-26", edituar:false, duplikat:false, prioritet:1, pershkrim:"Pjesë këmbimi — Motor, transmision, frena" },
  { id:"25", nrFatura:"FAT-2025-0360", data:"2025-06-15", shuma:128000,  tvsh:21333,  kompania:"Auto Servis Petreski DOOEL", numriKompanise:"4456789",  sektori:"Automotive", lloji:"dalëse", statusi:"konfirmuar", ocr:96,  afatiPageses:"2025-07-15", edituar:false, duplikat:false, pershkrim:"Servisim automjetesh — Flota Komunës së Shkupit" },
  { id:"26", nrFatura:"FAT-2025-0363", data:"2025-06-23", shuma:67500,   tvsh:11250,  kompania:"Auto Servis Petreski DOOEL", numriKompanise:"4456789",  sektori:"Automotive", lloji:"hyrëse", statusi:"vonuar",     ocr:89,  afatiPageses:"2025-06-23", edituar:false, duplikat:false, pershkrim:"Lubrifikantë dhe vajra motorike — Shell" },
];
EOF
echo "  ✓ data/invoices.ts"

# ── data/cashflow.ts ─────────────────────────────────────────────────────────
cat > data/cashflow.ts << 'EOF'
export const MONTHLY = [
  { m:"Jan", te_ardhura:1240000, shpenzime:890000 },
  { m:"Shk", te_ardhura:1560000, shpenzime:1020000 },
  { m:"Mar", te_ardhura:980000,  shpenzime:750000 },
  { m:"Pri", te_ardhura:2100000, shpenzime:1340000 },
  { m:"Maj", te_ardhura:1780000, shpenzime:1150000 },
  { m:"Qer", te_ardhura:2450000, shpenzime:1680000 },
];

export const CASHFLOW = [
  { data:"01 Qer", hyrje:320000,  dalje:145000, neto:175000 },
  { data:"05 Qer", hyrje:560000,  dalje:87500,  neto:472500 },
  { data:"10 Qer", hyrje:192000,  dalje:34200,  neto:157800 },
  { data:"15 Qer", hyrje:445000,  dalje:890000, neto:-445000 },
  { data:"19 Qer", hyrje:890000,  dalje:67800,  neto:822200 },
  { data:"22 Qer", hyrje:1240000, dalje:445000, neto:795000 },
];

export const CF_OPERATIVE = [
  { zeri:"Arkëtim nga klientët",            shuma:1250000, tip:"hyrje" as const },
  { zeri:"Pagesë furnitorëve",              shuma:-890000, tip:"dalje" as const },
  { zeri:"Pagesë rrogash dhe kontributesh", shuma:-186000, tip:"dalje" as const },
  { zeri:"Pagesë TVSH tek DAP",             shuma:-148000, tip:"dalje" as const },
  { zeri:"Të ardhura të tjera operative",   shuma:95000,   tip:"hyrje" as const },
];

export const CF_INVESTUESE = [
  { zeri:"Blerje pajisje zyre",             shuma:-340000, tip:"dalje" as const },
  { zeri:"Shitje aktivi i amortizuar",      shuma:120000,  tip:"hyrje" as const },
  { zeri:"Blerje kompjuter dhe harduer",    shuma:-85000,  tip:"dalje" as const },
];

export const CF_FINANCIARE = [
  { zeri:"Hua bankare e marrë",             shuma:500000,  tip:"hyrje" as const },
  { zeri:"Kthim i huasë bankare",           shuma:-210000, tip:"dalje" as const },
  { zeri:"Dividendë të paguar",             shuma:-80000,  tip:"dalje" as const },
];
EOF
echo "  ✓ data/cashflow.ts"

# ── data/klasat.ts ─────────────────────────────────────────────────────────
cat > data/klasat.ts << 'EOF'
export const KLASAT_EX = [
  { k:"0", emri:"Aktive afatgjata",      debit:8450000, kredit:2100000, nr:12, gjendje:6350000, nenklasat:[
    { nk:"0.1", emri:"Toka dhe ndërtesa",           debit:4200000, kredit:800000,  nr:3,  gjendje:3400000  },
    { nk:"0.2", emri:"Makineri dhe pajisje",         debit:2800000, kredit:900000,  nr:6,  gjendje:1900000  },
    { nk:"0.3", emri:"Mjete transporti",             debit:890000,  kredit:250000,  nr:2,  gjendje:640000   },
    { nk:"0.4", emri:"Aktive jo-materiale",          debit:560000,  kredit:150000,  nr:1,  gjendje:410000   },
  ]},
  { k:"1", emri:"Inventarë dhe mallra", debit:3200000, kredit:2800000, nr:45, gjendje:400000, nenklasat:[
    { nk:"1.1", emri:"Mallra për shitje",            debit:1800000, kredit:1700000, nr:28, gjendje:100000   },
    { nk:"1.2", emri:"Lëndë të parë",                debit:980000,  kredit:850000,  nr:12, gjendje:130000   },
    { nk:"1.3", emri:"Prodhime në process",          debit:420000,  kredit:250000,  nr:5,  gjendje:170000   },
  ]},
  { k:"2", emri:"Llogari me debitorë",  debit:5600000, kredit:3400000, nr:28, gjendje:2200000, nenklasat:[
    { nk:"2.1", emri:"Debitorë nga klientët",        debit:3400000, kredit:2100000, nr:18, gjendje:1300000  },
    { nk:"2.2", emri:"Paradhënie furnitorëve",       debit:1200000, kredit:800000,  nr:7,  gjendje:400000   },
    { nk:"2.3", emri:"Llogari të tjera",             debit:1000000, kredit:500000,  nr:3,  gjendje:500000   },
  ]},
  { k:"3", emri:"Kapital dhe rezerva",  debit:1200000, kredit:4800000, nr:8,  gjendje:-3600000, nenklasat:[
    { nk:"3.1", emri:"Kapitali aksionar",            debit:400000,  kredit:2500000, nr:2,  gjendje:-2100000 },
    { nk:"3.2", emri:"Rezerva ligjore",              debit:200000,  kredit:800000,  nr:3,  gjendje:-600000  },
    { nk:"3.3", emri:"Fitim i pa-shpërndarë",        debit:600000,  kredit:1500000, nr:3,  gjendje:-900000  },
  ]},
  { k:"4", emri:"Borxhe afatgjata",     debit:890000,  kredit:2450000, nr:6,  gjendje:-1560000, nenklasat:[
    { nk:"4.1", emri:"Hua bankare afatgjata",        debit:600000,  kredit:1800000, nr:3,  gjendje:-1200000 },
    { nk:"4.2", emri:"Hua nga ortakë",               debit:290000,  kredit:650000,  nr:3,  gjendje:-360000  },
  ]},
  { k:"5", emri:"Borxhe afatshkurtra", debit:1450000, kredit:3200000, nr:34, gjendje:-1750000, nenklasat:[
    { nk:"5.1", emri:"Detyrime ndaj furnitorëve",    debit:700000,  kredit:1800000, nr:18, gjendje:-1100000 },
    { nk:"5.2", emri:"Detyrime tatimore (TVSH/DAP)", debit:450000,  kredit:900000,  nr:10, gjendje:-450000  },
    { nk:"5.3", emri:"Detyrime ndaj punonjësve",     debit:300000,  kredit:500000,  nr:6,  gjendje:-200000  },
  ]},
  { k:"6", emri:"Shpenzime operative", debit:4200000, kredit:120000,  nr:89, gjendje:4080000, nenklasat:[
    { nk:"6.1", emri:"Shpenzimet e rrogave",         debit:1860000, kredit:0,       nr:24, gjendje:1860000  },
    { nk:"6.2", emri:"Shpenzimet e materialeve",     debit:1200000, kredit:80000,   nr:35, gjendje:1120000  },
    { nk:"6.3", emri:"Shpenzimet e amortizimit",     debit:740000,  kredit:0,       nr:12, gjendje:740000   },
    { nk:"6.4", emri:"Shpenzime të tjera",           debit:400000,  kredit:40000,   nr:18, gjendje:360000   },
  ]},
  { k:"7", emri:"Të ardhura",           debit:340000,  kredit:6780000, nr:67, gjendje:-6440000, nenklasat:[
    { nk:"7.1", emri:"Të ardhura nga shitjet",       debit:200000,  kredit:5200000, nr:52, gjendje:-5000000 },
    { nk:"7.2", emri:"Të ardhura financiare",        debit:80000,   kredit:980000,  nr:10, gjendje:-900000  },
    { nk:"7.3", emri:"Të ardhura të tjera",          debit:60000,   kredit:600000,  nr:5,  gjendje:-540000  },
  ]},
  { k:"8", emri:"Rezultati i periudhës",debit:680000,  kredit:1240000, nr:4,  gjendje:-560000, nenklasat:[
    { nk:"8.1", emri:"Fitimi i periudhës",           debit:680000,  kredit:1240000, nr:4,  gjendje:-560000  },
  ]},
  { k:"9", emri:"Llogari jashtëbilanciere",debit:200000,kredit:200000,nr:2,  gjendje:0, nenklasat:[
    { nk:"9.1", emri:"Garanci dhe angazhime",        debit:200000,  kredit:200000,  nr:2,  gjendje:0        },
  ]},
];
EOF
echo "  ✓ data/klasat.ts"

# ── data/smetkoplan.ts ─────────────────────────────────────────────────────────
cat > data/smetkoplan.ts << 'EOF'
export const SMETKOPLAN = [
  { kod:"100", emri:"Para në arkë",                  klasa:"1", normale:"debit",  gjendje:45000    },
  { kod:"110", emri:"Llogari bankare - MKD",          klasa:"1", normale:"debit",  gjendje:3155000  },
  { kod:"200", emri:"Klientë dhe blerës",             klasa:"2", normale:"debit",  gjendje:1300000  },
  { kod:"210", emri:"Paradhënie dhënë furnitorëve",   klasa:"2", normale:"debit",  gjendje:400000   },
  { kod:"300", emri:"Mallra — inventar",              klasa:"3", normale:"debit",  gjendje:100000   },
  { kod:"400", emri:"Toka dhe ndërtesa",              klasa:"4", normale:"debit",  gjendje:3400000  },
  { kod:"410", emri:"Makineri dhe pajisje",           klasa:"4", normale:"debit",  gjendje:1900000  },
  { kod:"420", emri:"Mjete transporti",               klasa:"4", normale:"debit",  gjendje:640000   },
  { kod:"430", emri:"Softuer dhe licenca",            klasa:"4", normale:"debit",  gjendje:410000   },
  { kod:"500", emri:"Kapitali aksionar",              klasa:"5", normale:"kredit", gjendje:-2100000 },
  { kod:"510", emri:"Rezerva ligjore",                klasa:"5", normale:"kredit", gjendje:-600000  },
  { kod:"520", emri:"Fitim i pa-shpërndarë",          klasa:"5", normale:"kredit", gjendje:-900000  },
  { kod:"600", emri:"Furnitorë dhe kreditorë",        klasa:"6", normale:"kredit", gjendje:-1100000 },
  { kod:"610", emri:"TVSH e pagueshme (DAP)",         klasa:"6", normale:"kredit", gjendje:-450000  },
  { kod:"620", emri:"Detyrime ndaj punonjësve",       klasa:"6", normale:"kredit", gjendje:-200000  },
  { kod:"700", emri:"Hua bankare afatgjata",          klasa:"7", normale:"kredit", gjendje:-1200000 },
  { kod:"710", emri:"Hua nga ortakë",                 klasa:"7", normale:"kredit", gjendje:-360000  },
  { kod:"800", emri:"Shitje mallrash dhe shërbimesh", klasa:"8", normale:"kredit", gjendje:-5000000 },
  { kod:"810", emri:"Të ardhura financiare",          klasa:"8", normale:"kredit", gjendje:-900000  },
  { kod:"900", emri:"Kostoja e mallrave të shitura",  klasa:"9", normale:"debit",  gjendje:1120000  },
  { kod:"910", emri:"Shpenzime rrogash",              klasa:"9", normale:"debit",  gjendje:1860000  },
  { kod:"920", emri:"Amortizim",                      klasa:"9", normale:"debit",  gjendje:740000   },
  { kod:"930", emri:"Shpenzime të tjera",             klasa:"9", normale:"debit",  gjendje:360000   },
];
EOF
echo "  ✓ data/smetkoplan.ts"

# ── data/rrogat.ts ─────────────────────────────────────────────────────────
cat > data/rrogat.ts << 'EOF'
export const RROGAT = [
  { punonjesi:"Marko Nikolovski",  pozita:"Menaxher Fin.", bruto:52000, neto:43680, kontribute:12480, tatim:4160 },
  { punonjesi:"Ana Petrovska",     pozita:"Kontabiliste",  bruto:38000, neto:31920, kontribute:9120,  tatim:3040 },
  { punonjesi:"Bojan Stojanov",    pozita:"Operator",      bruto:28000, neto:23520, kontribute:6720,  tatim:2240 },
  { punonjesi:"Elena Ristova",     pozita:"Shitëse",       bruto:26000, neto:21840, kontribute:6240,  tatim:2080 },
  { punonjesi:"Nikola Trajkovski", pozita:"IT Admin",      bruto:42000, neto:35280, kontribute:10080, tatim:3360 },
];
EOF
echo "  ✓ data/rrogat.ts"

# ── data/companyData.ts ─────────────────────────────────────────────────────────
cat > data/companyData.ts << 'EOF'
import { COMPANIES } from "./companies";
import { INVOICES } from "./invoices";
import { CASHFLOW, CF_OPERATIVE, CF_INVESTUESE, CF_FINANCIARE } from "./cashflow";
import { KLASAT_EX } from "./klasat";
import { SMETKOPLAN } from "./smetkoplan";
import { RROGAT } from "./rrogat";
import { Invoice } from "../types";

export interface CompanyData {
  invoices: Invoice[];
  cashflow: typeof CASHFLOW;
  cfOperative: typeof CF_OPERATIVE;
  cfInvestuese: typeof CF_INVESTUESE;
  cfFinanciare: typeof CF_FINANCIARE;
  klasat: typeof KLASAT_EX;
  smetkoplan: typeof SMETKOPLAN;
  rrogat: typeof RROGAT;
}

// Shënim: Faturat NDAHEN VËRTETË sipas kompanisë (kanë numriKompanise).
// Cash-Flow, Klasat, Smetkoplan, Rrogat mbeten të përbashkëta për tani —
// s'kishte të dhëna demo të ndara për to në projektin origjinal.
function buildCompanyData(companyId: string): CompanyData {
  return {
    invoices: INVOICES.filter(i => i.numriKompanise === companyId),
    cashflow: CASHFLOW,
    cfOperative: CF_OPERATIVE,
    cfInvestuese: CF_INVESTUESE,
    cfFinanciare: CF_FINANCIARE,
    klasat: KLASAT_EX,
    smetkoplan: SMETKOPLAN,
    rrogat: RROGAT,
  };
}

export const COMPANY_DATA: Record<string, CompanyData> = Object.fromEntries(
  COMPANIES.map(c => [c.numriKompanise, buildCompanyData(c.numriKompanise)])
);
EOF
echo "  ✓ data/companyData.ts"

# ── hooks/useCompanyData.ts ─────────────────────────────────────────────────────────
cat > hooks/useCompanyData.ts << 'EOF'
import { useState } from "react";
import { COMPANIES } from "../data/companies";
import { COMPANY_DATA } from "../data/companyData";

export function useCompanyData() {
  const [activeCompanyId, setActiveCompanyId] = useState(COMPANIES[0].numriKompanise);
  const activeCompany = COMPANIES.find(c => c.numriKompanise === activeCompanyId)!;
  const data = COMPANY_DATA[activeCompanyId];
  return { activeCompany, activeCompanyId, setActiveCompanyId, data, companies: COMPANIES };
}
EOF
echo "  ✓ hooks/useCompanyData.ts"

echo ""
echo "✅ Gati! U krijuan 11 file brenda: types/, utils/, data/, hooks/"
echo "   Hapi tjetër: zhvendos komponentët (Card, StatusBadge, views, modals) te components/"
