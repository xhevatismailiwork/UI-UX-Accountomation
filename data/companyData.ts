import { COMPANIES } from "./companies";
import { INVOICES } from "./invoices";
import { CASHFLOW, CF_OPERATIVE, CF_INVESTUESE, CF_FINANCIARE } from "./cashflow";
import { RROGAT } from "./rrogat";
import { Invoice } from "../types";
import { generateKlasat } from "../utils/klasat";

export interface CompanyData {
  invoices: Invoice[];
  cashflow: typeof CASHFLOW;
  cfOperative: typeof CF_OPERATIVE;
  cfInvestuese: typeof CF_INVESTUESE;
  cfFinanciare: typeof CF_FINANCIARE;
  klasat: ReturnType<typeof generateKlasat>;
  rrogat: typeof RROGAT;
}

// Shënim: Faturat dhe Klasat/Bilanci NDAHEN VËRTETË sipas kompanisë.
// Cash-Flow, Rrogat (bazë) mbeten të përbashkëta për tani —
// s'kishte të dhëna demo të ndara për to në projektin origjinal.
function buildCompanyData(companyId: string, index: number): CompanyData {
  const company = COMPANIES.find(c => c.numriKompanise === companyId)!;
  return {
    invoices: INVOICES.filter(i => i.numriKompanise === companyId),
    cashflow: CASHFLOW,
    cfOperative: CF_OPERATIVE,
    cfInvestuese: CF_INVESTUESE,
    cfFinanciare: CF_FINANCIARE,
    klasat: generateKlasat(company, index % 2 === 0), // disa kompani barazohen (Aktiva = Pasiva), disa jo
    rrogat: RROGAT,
  };
}

export const COMPANY_DATA: Record<string, CompanyData> = Object.fromEntries(
  COMPANIES.map((c, i) => [c.numriKompanise, buildCompanyData(c.numriKompanise, i)])
);
