import { Role } from "../types";

export const canEditInvoices = (r: Role) => r === "kontabilist" || r === "admin" || r === "superadmin";
export const canManageUsers = (r: Role) => r === "admin" || r === "superadmin";
export const canManageAdmins = (r: Role) => r === "superadmin";
// SME Owner sheh gjithçka për kompaninë e vet (fatura, kontabilitet, raporte, rroga) — vetëm s'mund të editojë.
export const canViewFullCompanyData = (r: Role) => r !== "operator";
// Kompanitë (portofoli shumë-kompani) dhe Përdoruesit janë vetëm për ata që menaxhojnë disa kompani/përdorues.
export const canManageMultipleCompanies = (r: Role) => r === "kontabilist" || r === "admin" || r === "superadmin";
// Pronari (sme_owner) menaxhon rrogat e veta; Operator jo.
export const canManagePayroll = (r: Role) => r !== "operator";
// Vetëm Super Admin dhe Admin mund të regjistrojnë/editojnë/fshijnë kompani (CRUD) dhe t'u ndryshojnë tipin e TVSH-së.
export const canManageCompanies = (r: Role) => r === "admin" || r === "superadmin";
// Super Admin, Admin dhe Kontabilisti mund të shtojnë llogari të reja Punonjësish (Operator).
// Pronari i biznesit (sme_owner) NUK mund të shtojë punonjës — pasi të shtohen nga të tjerët,
// pronari menaxhon vetëm Rrogat e tyre (shih canManagePayroll).
export const canAddEmployees = (r: Role) => r === "kontabilist" || r === "admin" || r === "superadmin";
// Ata që shtojnë punonjësin (Kontabilist/Admin/Super Admin) NUK e caktojnë rrogën — vetëm
// pronari i biznesit (sme_owner) e cakton/ndryshon shumën bruto të rrogës.
export const canSetSalary = (r: Role) => r === "sme_owner";
export const canAccessUserManagement = (r: Role) => canManageUsers(r) || r === "kontabilist";

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: "Super Admin",
  admin: "Admin (Kontabilist Kryesor)",
  kontabilist: "Kontabilist",
  sme_owner: "Pronar Biznesi (SME Owner)",
  operator: "Operator",
};
