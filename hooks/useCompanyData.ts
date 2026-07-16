import { useState } from "react";
import { COMPANIES } from "../data/companies";
import { COMPANY_DATA, CompanyData } from "../data/companyData";
import { CASHFLOW, CF_OPERATIVE, CF_INVESTUESE, CF_FINANCIARE } from "../data/cashflow";
import { Company } from "../types";
import { generateKlasat } from "../utils/klasat";

// Kompani e re (krijuar me CRUD) s'ka të dhëna historike të parashenjuara — nis me libra "të pastra".
const emptyCompanyData = (company: Company): CompanyData => ({
  invoices: [],
  cashflow: CASHFLOW,
  cfOperative: CF_OPERATIVE,
  cfInvestuese: CF_INVESTUESE,
  cfFinanciare: CF_FINANCIARE,
  klasat: generateKlasat(company, true),
  rrogat: [],
});

export function useCompanyData() {
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState(COMPANIES[0].numriKompanise);
  const activeCompany = companies.find(c => c.numriKompanise === activeCompanyId) ?? companies[0];
  const data = COMPANY_DATA[activeCompanyId] ?? emptyCompanyData(activeCompany);

  const addCompany = (c: Company) => setCompanies(cs => [...cs, c]);

  const updateCompany = (numriKompanise: string, changes: Partial<Company>) =>
    setCompanies(cs => cs.map(c => (c.numriKompanise === numriKompanise ? { ...c, ...changes } : c)));

  const deleteCompany = (numriKompanise: string) =>
    setCompanies(cs => cs.filter(c => c.numriKompanise !== numriKompanise));

  return { activeCompany, activeCompanyId, setActiveCompanyId, data, companies, addCompany, updateCompany, deleteCompany };
}
