"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { InvoiceModal } from "@/components/modals/InvoiceModal";
import { ScanModal } from "@/components/modals/ScanModal";
import { NewInvoiceModal } from "@/components/modals/NewInvoiceModal";
import { Dashboard } from "@/components/views/Dashboard";
import { InvoiceTable } from "@/components/views/InvoiceTable";
import { Kompanite } from "@/components/views/Kompanite";
import { CashFlow } from "@/components/views/CashFlow";
import { Klasat } from "@/components/views/Klasat";
import { Bilanci } from "@/components/views/Bilanci";
import { Raportet } from "@/components/views/Raportet";
import { Rrogat } from "@/components/views/Rrogat";
import { Cilesimet } from "@/components/views/Cilesimet";
import { Perdoruesit } from "@/components/views/Perdoruesit";
import { useCompanyData } from "@/hooks/useCompanyData";
import { USERS } from "@/data/users";
import { AppUser, Employee, Invoice, View } from "@/types";
import { daysDiff } from "@/utils/format";
import { tvshThresholdAlert } from "@/utils/risk";

const TITLES: Record<View, { title: string; sub?: string }> = {
  dashboard: { title: "Dashboard", sub: "Pasqyrë e përgjithshme" },
  faturat: { title: "Faturat", sub: "Lista e centralizuar e faturave" },
  pending: { title: "Faturat Pending", sub: "Rishikim i kërkuar nga kontabilisti" },
  izvodet: { title: "Izvodet", sub: "Ekstraktet bankare" },
  cashflow: { title: "Cash-Flow", sub: "Kontabiliteti" },
  klasat: { title: "Klasat & Nënklasat", sub: "Kontabiliteti" },
  bilanci: { title: "Bilanci", sub: "Kontabiliteti" },
  kompanite: { title: "Kompanitë" },
  raportet: { title: "Raportet & TVSH" },
  rrogat: { title: "Rrogat" },
  cilesimet: { title: "Cilësimet" },
  perdoruesit: { title: "Përdoruesit", sub: "Menaxhimi i qasjes dhe roleve" },
};

export default function Home() {
  const { activeCompany, activeCompanyId, setActiveCompanyId, data, companies, addCompany, updateCompany, deleteCompany } = useCompanyData();
  const [users, setUsers] = useState<AppUser[]>(USERS);
  const [currentUserId, setCurrentUserId] = useState<string>("3"); // Ana Petrovska (kontabilist) — demo default
  const [view, setView] = useState<View>("dashboard");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Partial<Invoice>>>({});
  const [addedInvoices, setAddedInvoices] = useState<Invoice[]>([]);
  const [deletedInvoiceIds, setDeletedInvoiceIds] = useState<Set<string>>(new Set());
  const [scanOpen, setScanOpen] = useState(false);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [payrollOverrides, setPayrollOverrides] = useState<Record<string, Employee[]>>({});

  const currentUser = users.find(u => u.id === currentUserId) ?? users[0];
  const role = currentUser.roli;

  // Kontabilist/SME Owner/Operator shohin vetëm kompanitë e deleguara/të tyre; Admin/Super Admin shohin të gjitha.
  const visibleCompanies = useMemo(() => {
    if (role === "kontabilist" || role === "sme_owner" || role === "operator") {
      return companies.filter(c => currentUser.kompanite.includes(c.numriKompanise));
    }
    return companies;
  }, [role, currentUser, companies]);

  useEffect(() => {
    if (visibleCompanies.length && !visibleCompanies.some(c => c.numriKompanise === activeCompanyId)) {
      setActiveCompanyId(visibleCompanies[0].numriKompanise);
    }
  }, [visibleCompanies, activeCompanyId, setActiveCompanyId]);

  const effectiveView: View = role === "operator" ? "faturat" : view;

  const invoices = useMemo(() => {
    const base = [...data.invoices, ...addedInvoices.filter(i => i.numriKompanise === activeCompanyId)];
    return base
      .filter(i => !deletedInvoiceIds.has(i.id))
      .map(i => (overrides[i.id] ? { ...i, ...overrides[i.id] } : i));
  }, [data.invoices, addedInvoices, activeCompanyId, overrides, deletedInvoiceIds]);

  const pendingInvoices = useMemo(
    () =>
      invoices
        .filter(i => i.statusi === "pending")
        .sort((a, b) => {
          const pa = a.prioritet ?? 99, pb = b.prioritet ?? 99;
          if (pa !== pb) return pa - pb;
          const da = a.afatiPageses !== "-" ? daysDiff(a.afatiPageses) : 999;
          const db = b.afatiPageses !== "-" ? daysDiff(b.afatiPageses) : 999;
          return da - db;
        }),
    [invoices]
  );

  const izvodet = useMemo(() => invoices.filter(i => i.lloji === "izvod"), [invoices]);

  const pendingCount = pendingInvoices.length;
  const riskCount = invoices.filter(i => i.statusi === "vonuar" || (i.statusi === "pending" && i.ocr < 70)).length;
  const alertCount = visibleCompanies.filter(c => c.alert || tvshThresholdAlert(c)).length;

  const handleConfirm = (id: string) =>
    setOverrides(o => ({ ...o, [id]: { ...o[id], statusi: "konfirmuar" } }));

  const handleSave = (id: string, changes: Partial<Invoice>) =>
    setOverrides(o => ({ ...o, [id]: { ...o[id], ...changes, edituar: true } }));

  const handleCreateInvoice = (inv: Invoice) => setAddedInvoices(a => [inv, ...a]);

  const handleDeleteInvoice = (id: string) => {
    setDeletedInvoiceIds(s => new Set(s).add(id));
    setSelected(null);
  };

  const handleAddUser = (u: Omit<AppUser, "id">) => setUsers(us => [...us, { ...u, id: `u-${Date.now()}` }]);

  const handleDelegate = (userId: string, kompanite: string[]) =>
    setUsers(us => us.map(u => (u.id === userId ? { ...u, kompanite } : u)));

  const rrogat = payrollOverrides[activeCompanyId] ?? data.rrogat;
  const setCompanyPayroll = (updater: (prev: Employee[]) => Employee[]) =>
    setPayrollOverrides(o => ({ ...o, [activeCompanyId]: updater(o[activeCompanyId] ?? data.rrogat) }));

  const handleAddEmployee = (e: Omit<Employee, "id">) => setCompanyPayroll(list => [...list, { ...e, id: `emp-${Date.now()}` }]);
  const handleEditEmployee = (id: string, changes: Partial<Employee>) =>
    setCompanyPayroll(list => list.map(e => (e.id === id ? { ...e, ...changes } : e)));
  const handleDeleteEmployee = (id: string) => setCompanyPayroll(list => list.filter(e => e.id !== id));

  const meta = TITLES[effectiveView];

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      <Sidebar
        view={effectiveView}
        setView={setView}
        users={users}
        currentUser={currentUser}
        onUserChange={setCurrentUserId}
        companies={visibleCompanies}
        activeCompanyId={activeCompanyId}
        onCompanyChange={setActiveCompanyId}
        pendingCount={pendingCount}
        riskCount={riskCount}
        alertCount={alertCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={meta.title}
          role={role}
          pendingCount={pendingCount}
          riskCount={riskCount}
          onScan={() => setScanOpen(true)}
          onNewInvoice={() => setNewInvoiceOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {effectiveView === "dashboard" && (
            <Dashboard company={activeCompany} invoices={invoices} companies={visibleCompanies} onSelect={setSelected} />
          )}
          {effectiveView === "faturat" && (
            <InvoiceTable title="Të Gjitha Faturat" sub={`${invoices.length} fatura për ${activeCompany.emri}`} invoices={invoices} onSelect={setSelected} />
          )}
          {effectiveView === "pending" && (
            <InvoiceTable
              title="Faturat Pending"
              sub="Renditur sipas urgjencës: afati i pagesës, shuma, historiku"
              invoices={pendingInvoices}
              onSelect={setSelected}
              emptyLabel="S'ka fatura pending — gjithçka është konfirmuar"
            />
          )}
          {effectiveView === "izvodet" && (
            <InvoiceTable title="Izvodet Bankare" sub="Ekstraktet e importuara nga bankat" invoices={izvodet} onSelect={setSelected} emptyLabel="S'ka izvode të importuara" />
          )}
          {effectiveView === "cashflow" && <CashFlow data={data} />}
          {effectiveView === "klasat" && <Klasat data={data} />}
          {effectiveView === "bilanci" && <Bilanci data={data} />}
          {effectiveView === "kompanite" && (
            <Kompanite
              role={role}
              companies={visibleCompanies}
              activeCompanyId={activeCompanyId}
              onSelectCompany={id => { setActiveCompanyId(id); setView("dashboard"); }}
              onChangeTvsh={(id, t) => updateCompany(id, { tvshTipi: t })}
              onAddCompany={addCompany}
              onEditCompany={updateCompany}
              onDeleteCompany={deleteCompany}
            />
          )}
          {effectiveView === "raportet" && <Raportet company={activeCompany} invoices={invoices} role={role} />}
          {effectiveView === "rrogat" && (
            <Rrogat role={role} rrogat={rrogat} onAdd={handleAddEmployee} onEdit={handleEditEmployee} onDelete={handleDeleteEmployee} />
          )}
          {effectiveView === "cilesimet" && <Cilesimet company={activeCompany} />}
          {effectiveView === "perdoruesit" && (
            <Perdoruesit currentUser={currentUser} users={users} companies={companies} onAddUser={handleAddUser} onDelegate={handleDelegate} />
          )}
        </main>
      </div>

      {selected && (
        <InvoiceModal
          inv={overrides[selected.id] ? { ...selected, ...overrides[selected.id] } : selected}
          role={role}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onSave={handleSave}
          onDelete={handleDeleteInvoice}
        />
      )}

      {scanOpen && (
        <ScanModal company={activeCompany} onClose={() => setScanOpen(false)} onCreate={handleCreateInvoice} />
      )}
      {newInvoiceOpen && (
        <NewInvoiceModal company={activeCompany} onClose={() => setNewInvoiceOpen(false)} onCreate={handleCreateInvoice} />
      )}
    </div>
  );
}
