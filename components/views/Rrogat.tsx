import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Employee, Role } from "../../types";
import { Card } from "../shared";
import { fmt } from "../../utils/format";
import { canAddEmployees, canManagePayroll, canSetSalary } from "../../utils/permissions";

const fromBruto = (bruto: number) => ({
  kontribute: Math.round(bruto * 0.24),
  tatim: Math.round(bruto * 0.08),
  neto: Math.round(bruto * 0.84),
});

interface RrogatProps {
  role: Role;
  rrogat: Employee[];
  onAdd: (e: Omit<Employee, "id">) => void;
  onEdit: (id: string, changes: Partial<Employee>) => void;
  onDelete: (id: string) => void;
}

function EmployeeForm({ initial, canEditBruto, onSave, onCancel }: {
  initial?: { punonjesi: string; pozita: string; bruto: number };
  canEditBruto: boolean;
  onSave: (v: { punonjesi: string; pozita: string; bruto: number }) => void;
  onCancel: () => void;
}) {
  const [punonjesi, setPunonjesi] = useState(initial?.punonjesi ?? "");
  const [pozita, setPozita] = useState(initial?.pozita ?? "");
  const [bruto, setBruto] = useState<number | "">(canEditBruto ? initial?.bruto ?? "" : initial?.bruto ?? 0);
  const valid = punonjesi.trim().length > 0 && pozita.trim().length > 0 && (!canEditBruto || (typeof bruto === "number" && bruto > 0));

  return (
    <div className="flex items-end gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex-1">
        <label className="text-[10px] text-slate-400 font-medium">Emri</label>
        <input value={punonjesi} onChange={e => setPunonjesi(e.target.value)} placeholder="p.sh. Elena Ristova"
          className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
      </div>
      <div className="flex-1">
        <label className="text-[10px] text-slate-400 font-medium">Pozita</label>
        <input value={pozita} onChange={e => setPozita(e.target.value)} placeholder="p.sh. Shitëse"
          className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
      </div>
      {canEditBruto ? (
        <div className="w-32">
          <label className="text-[10px] text-slate-400 font-medium">Bruto (MKD)</label>
          <input type="number" value={bruto} onChange={e => setBruto(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-blue-400" />
        </div>
      ) : (
        <div className="w-40">
          <label className="text-[10px] text-slate-400 font-medium">Bruto (MKD)</label>
          <p className="text-xs text-slate-400 italic px-2 py-1.5">Cakton pronari i biznesit</p>
        </div>
      )}
      <button disabled={!valid} onClick={() => valid && onSave({ punonjesi, pozita, bruto: (bruto === "" ? 0 : bruto) as number })}
        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <Check size={12} />Ruaj
      </button>
      <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
    </div>
  );
}

export function Rrogat({ role, rrogat, onAdd, onEdit, onDelete }: RrogatProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const canManage = canManagePayroll(role); // edito/fshi rreshta ekzistues (përfshirë sme_owner)
  const canAdd = canAddEmployees(role); // shto punonjës të ri — vetëm Kontabilist/Admin/Super Admin
  const canEditBruto = canSetSalary(role); // vetëm pronari i biznesit e cakton rrogën

  const totBruto = rrogat.reduce((s, r) => s + r.bruto, 0);
  const totNeto = rrogat.reduce((s, r) => s + r.neto, 0);
  const totKontribute = rrogat.reduce((s, r) => s + r.kontribute, 0);
  const totTatim = rrogat.reduce((s, r) => s + r.tatim, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[10px] text-slate-400 font-medium mb-1">Totali Bruto</p>
          <p className="text-base font-mono font-bold text-slate-800">{fmt(totBruto)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-slate-400 font-medium mb-1">Totali Neto</p>
          <p className="text-base font-mono font-bold text-emerald-600">{fmt(totNeto)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-slate-400 font-medium mb-1">Kontribute</p>
          <p className="text-base font-mono font-bold text-slate-600">{fmt(totKontribute)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-slate-400 font-medium mb-1">Tatimi Personal</p>
          <p className="text-base font-mono font-bold text-slate-600">{fmt(totTatim)}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Lista e Rrogave</h3>
            <p className="text-xs text-slate-400 mt-0.5">Qershor 2025 — Kostoja totale për kompaninë</p>
          </div>
          {canAdd && !adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-md hover:bg-[#0f2647] transition-colors">
              <Plus size={12} />Shto Punonjës
            </button>
          )}
        </div>

        {adding && canAdd && (
          <div className="p-3">
            <EmployeeForm
              canEditBruto={false}
              onCancel={() => setAdding(false)}
              onSave={v => { onAdd({ ...v, ...fromBruto(v.bruto) }); setAdding(false); }}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left font-medium px-4 py-2.5">Punonjësi</th>
                <th className="text-left font-medium px-4 py-2.5">Pozita</th>
                <th className="text-right font-medium px-4 py-2.5">Bruto</th>
                <th className="text-right font-medium px-4 py-2.5">Kontribute</th>
                <th className="text-right font-medium px-4 py-2.5">Tatim</th>
                <th className="text-right font-medium px-4 py-2.5">Neto</th>
                <th className="text-right font-medium px-4 py-2.5">Kosto Totale</th>
                {canManage && <th className="px-4 py-2.5"></th>}
              </tr>
            </thead>
            <tbody>
              {rrogat.map(r =>
                editingId === r.id ? (
                  <tr key={r.id}>
                    <td colSpan={canManage ? 8 : 7} className="p-2">
                      <EmployeeForm
                        initial={{ punonjesi: r.punonjesi, pozita: r.pozita, bruto: r.bruto }}
                        canEditBruto={canEditBruto}
                        onCancel={() => setEditingId(null)}
                        onSave={v => { onEdit(r.id, { ...v, ...fromBruto(v.bruto) }); setEditingId(null); }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{r.punonjesi}</td>
                    <td className="px-4 py-2.5 text-slate-500">{r.pozita}</td>
                    {r.bruto === 0 ? (
                      <td colSpan={5} className="px-4 py-2.5 text-slate-400 italic">Rroga s&apos;është caktuar ende nga pronari i biznesit</td>
                    ) : (
                      <>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-600">{fmt(r.bruto)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500">{fmt(r.kontribute)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500">{fmt(r.tatim)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600">{fmt(r.neto)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">{fmt(r.bruto + r.kontribute)}</td>
                      </>
                    )}
                    {canManage && (
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setEditingId(r.id)} className="p-1 text-blue-500 hover:text-blue-700"><Pencil size={12} /></button>
                          <button onClick={() => onDelete(r.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
