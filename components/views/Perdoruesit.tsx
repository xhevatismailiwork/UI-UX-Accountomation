import { useState } from "react";
import { UserPlus, ShieldCheck, Building2 } from "lucide-react";
import { AppUser, Company, Role } from "../../types";
import { Card, SectionHeader } from "../shared";
import { canAccessUserManagement, canAddEmployees, canManageAdmins, canManageUsers, ROLE_LABEL } from "../../utils/permissions";

const ROLE_BADGE: Record<Role, string> = {
  superadmin: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
  kontabilist: "bg-blue-50 text-blue-700 border-blue-200",
  sme_owner: "bg-teal-50 text-teal-700 border-teal-200",
  operator: "bg-slate-100 text-slate-600 border-slate-200",
};

interface PerdoruesitProps {
  currentUser: AppUser;
  users: AppUser[];
  companies: Company[];
  onAddUser: (u: Omit<AppUser, "id">) => void;
  onDelegate: (userId: string, kompanite: string[]) => void;
}

function AddUserForm({ roli, shtuarNga, kompanite, companies, onAdd }: {
  roli: Role; shtuarNga: string; kompanite: string[]; companies?: Company[]; onAdd: (u: Omit<AppUser, "id">) => void;
}) {
  const [emri, setEmri] = useState("");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState(companies?.[0]?.numriKompanise ?? "");
  const needsCompany = !!companies;
  const valid = emri.trim() && email.trim() && (!needsCompany || companyId);

  return (
    <div className="flex items-end gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex-1">
        <label className="text-[10px] text-slate-400 font-medium">Emri</label>
        <input value={emri} onChange={e => setEmri(e.target.value)} placeholder="p.sh. Elena Ristova"
          className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
      </div>
      <div className="flex-1">
        <label className="text-[10px] text-slate-400 font-medium">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="emri@kompania.mk"
          className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
      </div>
      {needsCompany && (
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 font-medium">Kompania</label>
          <select value={companyId} onChange={e => setCompanyId(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white">
            {companies!.map(c => <option key={c.id} value={c.numriKompanise}>{c.ikona} {c.emri}</option>)}
          </select>
        </div>
      )}
      <button
        disabled={!valid}
        onClick={() => {
          onAdd({ emri, email, roli, kompanite: needsCompany ? [companyId] : kompanite, shtuarNga });
          setEmri(""); setEmail("");
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-md hover:bg-[#0f2647] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <UserPlus size={12} />Shto {ROLE_LABEL[roli]}
      </button>
    </div>
  );
}

function DelegateRow({ user, companies, onDelegate }: { user: AppUser; companies: Company[]; onDelegate: (id: string, k: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(user.kompanite);

  return (
    <div className="px-4 pb-3">
      <button onClick={() => setOpen(o => !o)} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">
        {open ? "Mbyll delegimin" : "Delego Kompani →"}
      </button>
      {open && (
        <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1.5 max-h-48 overflow-y-auto">
          {companies.map(c => (
            <label key={c.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={selected.includes(c.numriKompanise)}
                onChange={e => setSelected(s => e.target.checked ? [...s, c.numriKompanise] : s.filter(x => x !== c.numriKompanise))} />
              <span>{c.ikona} {c.emri}</span>
            </label>
          ))}
          <button onClick={() => { onDelegate(user.id, selected); setOpen(false); }}
            className="mt-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-semibold rounded hover:bg-blue-700 transition-colors">
            Ruaj Delegimin
          </button>
        </div>
      )}
    </div>
  );
}

export function Perdoruesit({ currentUser, users, companies, onAddUser, onDelegate }: PerdoruesitProps) {
  const role = currentUser.roli;
  const companyName = (nr: string) => companies.find(c => c.numriKompanise === nr)?.emri ?? nr;

  if (!canAccessUserManagement(role)) {
    return (
      <Card className="p-8 flex flex-col items-center text-center gap-2">
        <ShieldCheck size={22} className="text-slate-300" />
        <p className="text-xs text-slate-500">Vetëm Super Admin, Admin dhe Kontabilisti mund të hyjnë te Menaxhimi i Përdoruesve.</p>
      </Card>
    );
  }

  // Kontabilisti sheh vetëm përdoruesit e kompanive të veta (kolegët e tij), jo gjithë sistemin.
  const visibleUsers = role === "kontabilist"
    ? users.filter(u => u.kompanite.some(k => currentUser.kompanite.includes(k)))
    : users;
  const addableCompanies = role === "kontabilist"
    ? companies.filter(c => currentUser.kompanite.includes(c.numriKompanise))
    : companies;

  return (
    <div className="space-y-5">
      {canManageAdmins(role) && (
        <Card>
          <SectionHeader title="Shto Admin të Ri" sub="Super Admin mund të shtojë pronarë të zyrave kontabël" />
          <div className="p-4">
            <AddUserForm roli="admin" shtuarNga={currentUser.emri} kompanite={[]} onAdd={onAddUser} />
          </div>
        </Card>
      )}

      {role === "admin" && (
        <Card>
          <SectionHeader title="Shto Kontabilist të Ri" sub="Kontabilistët e rinj mund të deleghen te kompani specifike më poshtë" />
          <div className="p-4">
            <AddUserForm roli="kontabilist" shtuarNga={currentUser.emri} kompanite={[]} onAdd={onAddUser} />
          </div>
        </Card>
      )}

      {canAddEmployees(role) && (
        <Card>
          <SectionHeader title="Shto Punonjës të Ri" sub="Super Admin, Admin dhe Kontabilisti mund të shtojnë punonjës — pronari i biznesit menaxhon vetëm Rrogat pasi ata shtohen" />
          <div className="p-4">
            <AddUserForm roli="operator" shtuarNga={currentUser.emri} kompanite={[]} companies={addableCompanies} onAdd={onAddUser} />
          </div>
        </Card>
      )}

      <Card>
        <SectionHeader title="Përdoruesit e Sistemit" sub={`${visibleUsers.length} përdorues gjithsej`} />
        <div className="divide-y divide-slate-50">
          {visibleUsers.map(u => (
            <div key={u.id}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{u.emri}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {u.kompanite.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Building2 size={11} />
                      <span>{u.kompanite.map(companyName).join(", ")}</span>
                    </div>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${ROLE_BADGE[u.roli]}`}>{ROLE_LABEL[u.roli]}</span>
                </div>
              </div>
              {u.shtuarNga && <p className="px-4 pb-1 -mt-2 text-[10px] text-slate-300">Shtuar nga {u.shtuarNga}</p>}
              {(u.roli === "kontabilist" || u.roli === "operator") && canManageUsers(role) && (
                <DelegateRow user={u} companies={companies} onDelegate={onDelegate} />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
