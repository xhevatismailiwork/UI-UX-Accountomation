import { KLASAT_EX } from "../data/klasat";
import { Company } from "../types";

const BASE_QARKULLIMI = 8450000; // qarkullimi i TechSoft DOOEL, referenca e shabllonit KLASAT_EX

// Ndan një shumë totale në N pjesë me pesha të ndryshme (jo identike, për realizëm),
// duke garantuar që shuma e pjesëve mbetet ekzaktësisht e barabartë me totalin.
function splitAmount(total: number, count: number): number[] {
  if (count <= 0) return [];
  const weights = Array.from({ length: count }, (_, i) => 1 + (i % 4));
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => Math.round((total * w) / sumW));
  const diff = total - raw.reduce((a, b) => a + b, 0);
  raw[raw.length - 1] += diff;
  return raw;
}

// Gjeneron klasat kontabël specifike për secilën kompani (shkallëzuar sipas qarkullimit),
// dhe për disa kompani e "mbyll" klasën 9 (Kapitali) që Aktiva = Pasiva saktësisht.
// Klasat sipas Pravilnik-ut zyrtar: Aktiva = klasat 0,1,3,6; Pasiva = Detyrime (klasa 2) + Kapitali (klasa 9);
// klasat 4,5,7,8 janë të pasqyrës së të ardhurave/rezultateve, jashtë bilancit.
// Llogaritë sintetike (trishifrore, "llogarite") brenda çdo nënklase janë ndarje fiktive
// e shumës së nënklasës — nuk kanë shifra zyrtare individuale në Pravilnik.
export function generateKlasat(company: Company, balance: boolean) {
  const mult = company.qarkullimi / BASE_QARKULLIMI;

  const klasat = KLASAT_EX.map(k => {
    const debit = Math.round(k.debit * mult);
    const kredit = Math.round(k.kredit * mult);
    const nenklasat = k.nenklasat.map(nk => {
      const d = Math.round(nk.debit * mult);
      const kr = Math.round(nk.kredit * mult);
      const nr = nk.nr > 0 ? Math.max(1, Math.round(nk.nr * mult)) : 0;

      const n = nk.llogarite.length;
      const debitSplit = splitAmount(d, n);
      const kreditSplit = splitAmount(kr, n);
      const nrSplit = splitAmount(nr, n);
      const llogarite = nk.llogarite.map((l, i) => ({
        ...l,
        debit: debitSplit[i] ?? 0,
        kredit: kreditSplit[i] ?? 0,
        nr: Math.max(0, nrSplit[i] ?? 0),
        gjendje: (debitSplit[i] ?? 0) - (kreditSplit[i] ?? 0),
      }));

      return { ...nk, debit: d, kredit: kr, nr, gjendje: d - kr, llogarite };
    });
    const nr = k.nr > 0 ? Math.max(1, Math.round(k.nr * mult)) : 0;
    return { ...k, debit, kredit, nr, gjendje: debit - kredit, nenklasat };
  });

  if (balance) {
    const sum = (ks: string[]) => klasat.filter(k => ks.includes(k.k)).reduce((s, k) => s + Math.abs(k.gjendje), 0);
    const aktiva = sum(["0", "1", "3", "6"]);
    const detyrime = sum(["2"]);
    const targetKapitali = aktiva - detyrime; // që Pasiva (Kapitali + Detyrimet) të barazohet me Aktivën
    const k9 = klasat.find(k => k.k === "9")!;
    k9.gjendje = -Math.abs(targetKapitali); // klasa 9 (Kapitali) është kredituese (gjendje negative)
    k9.kredit = k9.debit - k9.gjendje;
  }

  return klasat;
}
