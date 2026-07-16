// ── Types ─────────────────────────────────────────────────────────────────────
// Role hierarchy (cascading — each higher role can do everything the ones below can):
//   superadmin  → shton Admin-a (p.sh. pronarë zyre kontabël)
//   admin       → shton Kontabilistë, u delegon atyre kompani specifike
//   kontabilist → i caktuar te kompani specifike, konfirmon/edit/aprovon fatura
//   sme_owner   → pronari/menaxheri i biznesit — sheh GJITHÇKA (fatura, raporte, TVSH, rroga)
//                 për kompaninë e vet, mund të ngarkojë/skanojë fatura, por s'mund të
//                 konfirmojë/editojë/aprovojë/dorëzojë asgjë zyrtare
//   operator    → punonjësi i biznesit — vetëm skanon + shikon historinë e vet (më i kufizuar se sme_owner)
export type Role = "superadmin" | "admin" | "kontabilist" | "sme_owner" | "operator";
export type InvoiceStatus = "konfirmuar" | "pending" | "refuzuar" | "duplikat" | "vonuar";
export type InvoiceType = "hyrëse" | "dalëse" | "izvod";
export type TVSHType = "pa_tvsh" | "tvsh_tremujore" | "tvsh_mujore";
export type View =
  | "dashboard" | "faturat" | "pending" | "izvodet"
  | "cashflow" | "klasat" | "bilanci"
  | "kompanite" | "raportet" | "rrogat" | "cilesimet" | "perdoruesit";

export interface Employee {
  id: string; punonjesi: string; pozita: string;
  bruto: number; neto: number; kontribute: number; tatim: number;
}

export interface AppUser {
  id: string; emri: string; email: string; roli: Role;
  kompanite: string[]; // numriKompanise[] të deleguara (relevante për kontabilist/operator)
  shtuarNga?: string;
}

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
