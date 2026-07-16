export const TODAY = new Date("2025-06-25");

export const daysDiff = (d: string) =>
  Math.ceil((new Date(d).getTime() - TODAY.getTime()) / 86400000);

// Manual thousands-grouping instead of toLocaleString("mk-MK"): Node's built-in
// (small-icu) ships without full Macedonian locale data, so the server render
// groups digits differently than the browser and breaks hydration.
export const fmtNum = (n: number) => {
  const sign = n < 0 ? "-" : "";
  const digits = Math.round(Math.abs(n)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return sign + grouped;
};

export const fmt = (n: number) => fmtNum(n) + " MKD";

export const addDays = (d: string, days: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
};

export const fmtK = (n: number) => {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (Math.abs(n) >= 1000)    return (n / 1000).toFixed(0) + "K";
  return n.toString();
};
