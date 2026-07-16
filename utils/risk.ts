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
